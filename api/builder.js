const crypto = require('crypto');
const https = require('https');

const ENV = {
  password: process.env.BUILDER_PASSWORD || 'filt1234!',
  secret: process.env.BUILDER_JWT_SECRET || 'filt-builder-secret-key-2026',
  pat: process.env.GITHUB_PAT,
  owner: 'filtehwa',
  repo: 'filt_website',
  branch: 'vercel-deploy'
};

// --- 토큰 인증 ---
function makeToken() {
  const data = Buffer.from(JSON.stringify({ exp: Date.now() + 86400000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', ENV.secret).update(data).digest('hex');
  return data + '.' + sig;
}

function checkToken(cookie = '') {
  const m = cookie.match(/filt_token=([^;]+)/);
  if (!m) return false;
  const [data, sig] = m[1].split('.');
  if (!data || !sig) return false;
  const expected = crypto.createHmac('sha256', ENV.secret).update(data).digest('hex');
  if (sig !== expected) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now();
  } catch (e) {
    return false;
  }
}

// --- GitHub REST API 헬퍼 ---
function ghGet(path) {
  return new Promise((res, rej) => {
    https.get({
      hostname: 'api.github.com',
      path,
      headers: {
        'Authorization': `Bearer ${ENV.pat}`,
        'User-Agent': 'filt-builder/1.0',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { res(JSON.parse(d)); } catch (e) { res(d); }
      });
    }).on('error', rej);
  });
}

function ghPut(path, body) {
  return new Promise((res, rej) => {
    const s = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ENV.pat}`,
        'User-Agent': 'filt-builder/1.0',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(s)
      }
    }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => {
        try { res(JSON.parse(d)); } catch (e) { res(d); }
      });
    });
    req.on('error', rej);
    req.write(s);
    req.end();
  });
}

// --- 외부 URL(아임웹 CDN 등) 버퍼 다운로드 ---
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// --- HTML 파싱 ---
function parseHtml(html) {
  const imgSection = (html.match(/<div class="img-section">([\s\S]*?)<\/div>/) || [])[1] || '';
  const images = [];
  const imgRe = /<img\s[^>]*src="([^"]*)"[^>]*class="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g;
  let m;
  while ((m = imgRe.exec(imgSection)) !== null) {
    images.push({ src: m[1], class: m[2].trim(), alt: m[3] });
  }

  const textContent = (html.match(/<div class="text-content">([\s\S]*?)<\/div>\s*\n?\s*<div class="fixed-table">/) || [])[1] || '';

  const table = {};
  table.titleEn = (html.match(/class="project-title-en"\s*>([\s\S]*?)<\/div>/) || [])[1]?.trim() || '';
  table.titleKo = (html.match(/class="project-subtitle"\s*>([\s\S]*?)<\/div>/) || [])[1]?.trim() || '';
  const rows = [...html.matchAll(/<th>([^<]+)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g)];
  const keyMap = {
    'STATUS': 'status', 'YEAR': 'year', 'LOCATION': 'location',
    'PROGRAM': 'program', 'FLOORS': 'floors', 'TYPE': 'type',
    'BUILDING AREA': 'buildingArea', 'TOTAL AREA': 'totalArea',
    'CLIENT': 'client', 'CONSTRUCTION': 'construction',
    'PHOTOGRAPHER': 'photographer', 'COWORK': 'cowork'
  };
  for (const [, th, td] of rows) {
    const k = keyMap[th.trim()];
    if (k) table[k] = td.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').trim();
  }

  return { images, textContent, table };
}

// --- HTML 재조합 ---
function rebuildPcHtml(original, { images, textContent, table }) {
  let html = original;

  const imgHtml = images.map(img =>
    `\t<img src="${img.src}" \n\t\t\t  class="${img.class}" alt="${img.alt}"><hr> `
  ).join('\n');
  html = html.replace(
    /(<div class="img-section">)([\s\S]*?)(<\/div>\s*\n\s*<section)/,
    (_, a, __, c) => a + '\n' + imgHtml + '\n  ' + c
  );

  html = html.replace(
    /(<div class="text-content">)([\s\S]*?)(<\/div>\s*\n?\s*<div class="fixed-table">)/,
    (_, a, __, c) => a + textContent + c
  );

  html = html.replace(/(<div class="project-title-en">)[^<]*/, `$1${table.titleEn}`);
  html = html.replace(/(<div class="project-subtitle">)[^<]*/, `$1${table.titleKo}`);
  const replace = (th, val) => {
    const locVal = (val || '').replace(/\n/g, '<br>');
    html = html.replace(
      new RegExp(`(<th>${th}<\\/th><td[^>]*>)[\\s\\S]*?(<\\/td>)`),
      (_, a, b) => a + locVal + b
    );
  };
  replace('STATUS', table.status);
  replace('YEAR', table.year);
  replace('LOCATION', table.location);
  replace('PROGRAM', table.program);
  replace('FLOORS', table.floors);
  replace('TYPE', table.type);
  replace('CLIENT', table.client);
  replace('CONSTRUCTION', table.construction);
  replace('PHOTOGRAPHER', table.photographer);
  replace('COWORK', table.cowork);
  html = html.replace(/(<td id="buildingareaCell">)[^<]*/, `$1${table.buildingArea || ''}`);
  html = html.replace(/(<td id="totalAreaCell">)[^<]*/, `$1${table.totalArea || ''}`);

  return html;
}

function rebuildMobileHtml(original, { images, table }) {
  let html = original;

  const imgHtml = images.map(img =>
    `\t<img src="${img.src}" \n\t\t\t  class="${img.class}" alt="${img.alt}"><hr> `
  ).join('\n');
  html = html.replace(
    /(<div class="img-section">)([\s\S]*?)(<\/div>)/,
    (_, a, __, c) => a + '\n' + imgHtml + '\n  ' + c
  );

  html = html.replace(/(<div class="project-title-en">)[^<]*/, `$1${table.titleEn}`);
  html = html.replace(/(<div class="project-subtitle">)[^<]*/, `$1${table.titleKo}`);
  const replace = (th, val) => {
    html = html.replace(
      new RegExp(`(<th>${th}<\\/th><td[^>]*>)[\\s\\S]*?(<\\/td>)`),
      (_, a, b) => a + (val || '').replace(/\n/g, '<br>') + b
    );
  };
  replace('STATUS', table.status);
  replace('YEAR', table.year);
  replace('LOCATION', table.location);
  replace('PROGRAM', table.program);
  replace('FLOORS', table.floors);
  replace('TYPE', table.type);
  replace('CLIENT', table.client);
  replace('CONSTRUCTION', table.construction);
  replace('PHOTOGRAPHER', table.photographer);
  replace('COWORK', table.cowork);
  html = html.replace(/(<td id="buildingareaCell">)[^<]*/, `$1${table.buildingArea || ''}`);
  html = html.replace(/(<td id="totalAreaCell">)[^<]*/, `$1${table.totalArea || ''}`);

  return html;
}

function readBody(req) {
  return new Promise((res) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => {
      try { res(JSON.parse(d)); } catch { res({}); }
    });
  });
}

// --- 메인 핸들러 ---
module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action');
  const authed = checkToken(req.headers.cookie);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'POST') {
    const body = await readBody(req);

    if (body.action === 'login') {
      if (body.password === ENV.password) {
        const token = makeToken();
        res.setHeader('Set-Cookie', `filt_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);
        return res.end(JSON.stringify({ ok: true }));
      }
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Invalid password' }));
    }

    if (body.action === 'logout') {
      res.setHeader('Set-Cookie', 'filt_token=; HttpOnly; Path=/; Max-Age=0');
      return res.end(JSON.stringify({ ok: true }));
    }

    if (!authed) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    // 1. 아임웹 이미지들을 GitHub로 가져오기 (마이그레이션)
    if (body.action === 'import-imweb-images') {
      try {
        const imageUrls = body.urls || [];
        const results = [];

        for (const imgUrl of imageUrls) {
          if (!imgUrl.includes('imweb.me')) continue;
          
          // 파일명 추출 (예: cb1135fa8dcde.jpg)
          const parts = imgUrl.split('/');
          const filename = parts[parts.length - 1];
          const targetPath = `images/tempin/${filename}`;

          // 이미지 다운로드 (아임웹 원본은 건드리지 않음)
          const buffer = await fetchBuffer(imgUrl);
          const base64Content = buffer.toString('base64');

          // 기존 파일 sha 확인 (덮어쓰기 대응)
          let existingSha = null;
          try {
            const check = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}?ref=${ENV.branch}`);
            if (check && check.sha) existingSha = check.sha;
          } catch (e) {
            // 없으면 새로 생성
          }

          // GitHub vercel-deploy 브랜치에 저장
          await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}`, {
            message: `import: ${filename} from imweb to GitHub`,
            content: base64Content,
            sha: existingSha || undefined,
            branch: ENV.branch
          });

          results.push({
            original: imgUrl,
            newUrl: `/${targetPath}`
          });
        }

        return res.end(JSON.stringify({ ok: true, count: results.length, mapped: results }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    // 2. 단일 새 이미지 GitHub 직접 업로드
    if (body.action === 'upload-image') {
      try {
        const { filename, base64Data } = body;
        const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const targetPath = `images/tempin/${cleanName}`;

        let existingSha = null;
        try {
          const check = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}?ref=${ENV.branch}`);
          if (check && check.sha) existingSha = check.sha;
        } catch (e) {}

        await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}`, {
          message: `upload: ${cleanName} via builder`,
          content: base64Data,
          sha: existingSha || undefined,
          branch: ENV.branch
        });

        return res.end(JSON.stringify({ ok: true, url: `/${targetPath}` }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    // 3. 템프인 프로젝트 저장 및 Vercel 배포 트리거
    if (body.action === 'save-tempin') {
      try {
        const pcFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-pc.html?ref=${ENV.branch}`);
        const mobileFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-mobile.html?ref=${ENV.branch}`);

        const pcOriginal = Buffer.from(pcFile.content, 'base64').toString('utf8');
        const mobileOriginal = Buffer.from(mobileFile.content, 'base64').toString('utf8');

        const newPc = rebuildPcHtml(pcOriginal, body);
        const newMobile = rebuildMobileHtml(mobileOriginal, body);

        await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-pc.html`, {
          message: 'builder: update tempin-pc.html',
          content: Buffer.from(newPc).toString('base64'),
          sha: pcFile.sha,
          branch: ENV.branch
        });

        await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-mobile.html`, {
          message: 'builder: update tempin-mobile.html',
          content: Buffer.from(newMobile).toString('base64'),
          sha: mobileFile.sha,
          branch: ENV.branch
        });

        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }
  }

  if (req.method === 'GET') {
    if (action === 'check-auth') {
      if (authed) return res.end(JSON.stringify({ ok: true }));
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    if (!authed) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    if (action === 'get-tempin') {
      try {
        const pcFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-pc.html?ref=${ENV.branch}`);
        const mobileFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/tempin-mobile.html?ref=${ENV.branch}`);

        const html = Buffer.from(pcFile.content, 'base64').toString('utf8');
        const parsed = parseHtml(html);

        return res.end(JSON.stringify({
          ...parsed,
          pcSha: pcFile.sha,
          mobileSha: mobileFile.sha
        }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }
  }

  res.statusCode = 400;
  res.end(JSON.stringify({ error: 'Bad request' }));
};
