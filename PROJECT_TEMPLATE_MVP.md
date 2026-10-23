# Shared project template MVP

The Tempin demo separates reusable presentation from project-specific content:

- `project-template.js` renders the page from a project ID.
- `project-template.css` contains the shared layout and styling.
- `projects/tempin.json` contains Tempin's images, description, and overview.
- `tempin-template-demo.html` is the standalone Vercel preview.

## Imweb embed

Add this to the page's HTML/code widget, replacing the test host with the final shared template host after validation:

```html
<div class="filt-project-mount" data-filt-project="tempin"></div>
<script src="https://filtwebsite-verceltest.vercel.app/project-template.js" data-project-id="tempin"></script>
```

The script fetches `projects/tempin.json` from the same host as the shared template. A new page can use the same template by providing another project ID and a matching JSON file.

This first preview matches the PC `test-pc.html` layout. Mobile layout and the Imweb widget's page-height behavior should be confirmed separately before replacing any existing page.

## Project JSON

Each project JSON contains:

- `overview.titleEn` and `overview.subtitle`
- `overview.fields`: ordered label/value pairs; area values may also define `areaM2`
- `images`: ordered `src`, `class`, `alt`, `fit`, and `rotation`
- `descriptionHtml`: rich text and captioned supplemental images

Keep `descriptionHtml` trusted and editor-authored. It is inserted as HTML to preserve rich text and figures.

This MVP is a separate preview and does not replace the current builder page or change the production site. Confirm the template in the Imweb code widget before using it on additional project pages.
