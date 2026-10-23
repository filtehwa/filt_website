const crypto = require('crypto');
const https = require('https');

const ENV = {
  password: process.env.BUILDER_PASSWORD,
  secret: process.env.BUILDER_JWT_SECRET,
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
  if (!ENV.pat) {
    return Promise.reject(new Error('GITHUB_PAT 환경변수가 Vercel에 설정되어 있지 않습니다.'));
  }
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
        try {
          const parsed = JSON.parse(d);
          if (r.statusCode >= 400) {
            return rej(new Error(parsed.message || `GitHub API 오류 (${r.statusCode})`));
          }
          res(parsed);
        } catch (e) {
          rej(new Error(`GitHub 응답 파싱 실패 (${r.statusCode}): ${d.slice(0, 100)}`));
        }
      });
    }).on('error', rej);
  });
}

function ghPut(path, body) {
  if (!ENV.pat) {
    return Promise.reject(new Error('GITHUB_PAT 환경변수가 Vercel에 설정되어 있지 않습니다.'));
  }
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
        try {
          const parsed = JSON.parse(d);
          if (r.statusCode >= 400) {
            return rej(new Error(parsed.message || `GitHub 업로드 오류 (${r.statusCode})`));
          }
          res(parsed);
        } catch (e) {
          rej(new Error(`GitHub 응답 파싱 실패 (${r.statusCode}): ${d.slice(0, 100)}`));
        }
      });
    });
    req.on('error', rej);
    req.write(s);
    req.end();
  });
}

// --- 외부 URL 버퍼 다운로드 ---
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
  const imgRe = /<img\b[^>]*>/g;
  let m;
  while ((m = imgRe.exec(imgSection)) !== null) {
    const getAttribute = name => (m[0].match(new RegExp(`\\b${name}="([^"]*)"`, 'i')) || [])[1] || '';
    const rotation = Number(getAttribute('data-rotation'));
    images.push({
      src: getAttribute('src'),
      class: getAttribute('class').trim(),
      alt: getAttribute('alt'),
      rotation: [0, 90, 180, 270].includes(rotation) ? rotation : 0
    });
  }

  const textContent = (html.match(/<div class="text-content">([\s\S]*?)<\/div>\s*(?:<!--[\s\S]*?-->\s*)*<div class="fixed-table">/) || [])[1] || '';
  const tableHtml = (html.match(/<div class="fixed-table">([\s\S]*?)<\/div>\s*\n?\s*<\/section>/) || [])[1] || '';

  return { images, textContent, tableHtml };
}

// --- HTML 재조합 ---
function rebuildPcHtml(original, { images, textContent, tableHtml }) {
  let html = original;

  const escapeAttribute = value => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const imgHtml = images.map(img => {
    const src = String(img.src || '');
    const imageClass = String(img.class || '');
    const rotation = Number(img.rotation || 0);
    if (!/^(https?:\/\/|\/)/i.test(src) || !/^(portrait|landscape|drawing)$/.test(imageClass)) {
      throw new Error('이미지 주소 또는 비율 정보가 올바르지 않습니다.');
    }
    if (![0, 90, 180, 270].includes(rotation)) {
      throw new Error('이미지 회전 정보가 올바르지 않습니다.');
    }
    const rotationAttribute = img.rotation === undefined ? '' : ` data-rotation="${rotation}"`;
    return `\t<img src="${escapeAttribute(src)}" \n\t\t\t  class="${imageClass}" alt="${escapeAttribute(img.alt)}"${rotationAttribute}><hr> `;
  }).join('\n');
  html = html.replace(
    /(<div class="img-section">)([\s\S]*?)(<\/div>\s*(?:<!--[\s\S]*?-->\s*)*<section)/,
    (_, a, __, c) => a + '\n' + imgHtml + '\n  ' + c
  );

  html = html.replace(
    /(<div class="text-content">)([\s\S]*?)(<\/div>\s*(?:<!--[\s\S]*?-->\s*)*<div class="fixed-table">)/,
    (_, a, __, c) => a + textContent + c
  );

  if (tableHtml) {
    html = html.replace(
      /(<div class="fixed-table">)([\s\S]*?)(<\/div>\s*\n?\s*<\/section>)/,
      (_, a, __, c) => a + '\n' + tableHtml + '\n    ' + c
    );
  }

  return html;
}

function rebuildMobileHtml(original, { images, tableHtml }) {
  let html = original;

  const imgHtml = images.map(img =>
    `\t<img src="${img.src}" \n\t\t\t  class="${img.class}" alt="${img.alt}"><hr> `
  ).join('\n');
  html = html.replace(
    /(<div class="img-section">)([\s\S]*?)(<\/div>)/,
    (_, a, __, c) => a + '\n' + imgHtml + '\n  ' + c
  );

  if (tableHtml) {
    html = html.replace(
      /(<div class="fixed-table">)([\s\S]*?)(<\/div>)/,
      (_, a, __, c) => a + '\n' + tableHtml + '\n    ' + c
    );
  }

  return html;
}

function readBody(req) {
  return new Promise((res) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => {
      try { res(JSON.parse(d)); } catch { res(null); }
    });
  });
}

// --- 메인 핸들러 ---
module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const action = url.searchParams.get('action');

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  const missingSettings = [
    !ENV.password && 'BUILDER_PASSWORD',
    !ENV.secret && 'BUILDER_JWT_SECRET',
    !ENV.pat && 'GITHUB_PAT'
  ].filter(Boolean);
  if (missingSettings.length) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: `Vercel 환경변수 설정이 필요합니다: ${missingSettings.join(', ')}`
    }));
  }

  const authed = checkToken(req.headers.cookie);

  if (req.method === 'POST') {
    const body = await readBody(req);
    if (!body) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: '전송된 데이터가 너무 크거나 올바른 JSON 형식이 아닙니다.' }));
    }

    if (body.action === 'login') {
      if (body.password === ENV.password) {
        const token = makeToken();
        res.setHeader('Set-Cookie', `filt_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`);
        return res.end(JSON.stringify({ ok: true }));
      }
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: '비밀번호가 올바르지 않습니다.' }));
    }

    if (body.action === 'logout') {
      res.setHeader('Set-Cookie', 'filt_token=; HttpOnly; Path=/; Max-Age=0');
      return res.end(JSON.stringify({ ok: true }));
    }

    if (!authed) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.' }));
    }

    // 아임웹 이미지 일괄 가져오기
    if (body.action === 'import-imweb-images') {
      try {
        const imageUrls = body.urls || [];
        const results = [];

        for (const imgUrl of imageUrls) {
          if (!imgUrl.includes('imweb.me')) continue;
          
          const parts = imgUrl.split('/');
          const filename = parts[parts.length - 1];
          const targetPath = `images/tempin/${filename}`;

          const buffer = await fetchBuffer(imgUrl);
          const base64Content = buffer.toString('base64');

          let existingSha = null;
          try {
            const check = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}?ref=${ENV.branch}`);
            if (check && check.sha) existingSha = check.sha;
          } catch (e) {}

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

    // 새 이미지 업로드
    if (body.action === 'upload-image') {
      try {
        const { filename, base64Data } = body;
        if (!base64Data) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: '이미지 데이터가 없습니다.' }));
        }

        const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
        const rand = crypto.randomBytes(4).toString('hex');
        const cleanName = `upload_${Date.now()}_${rand}.${ext}`;
        const targetPath = `images/tempin/${cleanName}`;

        await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/${targetPath}`, {
          message: `upload: ${cleanName} via builder`,
          content: base64Data,
          branch: ENV.branch
        });

        return res.end(JSON.stringify({ ok: true, url: `/${targetPath}` }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    // 템프인 프로젝트 저장 및 게시
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

    if (body.action === 'save-test-pc') {
      try {
        const pcFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/test-pc.html?ref=${ENV.branch}`);
        const pcOriginal = Buffer.from(pcFile.content, 'base64').toString('utf8');
        const newPc = rebuildPcHtml(pcOriginal, body);

        await ghPut(`/repos/${ENV.owner}/${ENV.repo}/contents/test-pc.html`, {
          message: 'builder: update test-pc.html',
          content: Buffer.from(newPc).toString('base64'),
          sha: pcFile.sha,
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

        return res.end(JSON.stringify(parsed));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (action === 'get-test-pc') {
      try {
        const pcFile = await ghGet(`/repos/${ENV.owner}/${ENV.repo}/contents/test-pc.html?ref=${ENV.branch}`);
        const html = Buffer.from(pcFile.content, 'base64').toString('utf8');
        const parsed = parseHtml(html);

        return res.end(JSON.stringify(parsed));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    }
  }

  res.statusCode = 400;
  res.end(JSON.stringify({ error: '잘못된 요청입니다.' }));
};
