# Vehicle overview illustration assets

This directory contains the generated 3D illustration system for vehicle
overview facts. The supplied July 29 visual is a style reference only and is
not redistributed here.

## Shared art direction

- Square 1254 x 1254 PNG.
- Genuine transparent alpha outside the object and soft grounding shadow.
- Centered three-quarter view with roughly 76% visible-object width.
- Friendly, semi-realistic 3D toy/resin finish with rounded glossy surfaces.
- Royal blue `#2563EB`, charcoal/navy, restrained silver, and one small red
  accent near `#E63946`.
- No labels, readable text, digits, logos, watermarks, canvas cards, or scenery.
- `engine-size.png` is the approved internal style anchor for later assets.

## Ready assets

- `body-type.png`
- `category.png`
- `colors.png`
- `condition.png`
- `doors.png`
- `drive-type.png`
- `engine-size.png`
- `fuel.png`
- `location.png`
- `mileage.png`
- `model-variant.png`
- `registration.png`
- `seats.png`
- `subcategory.png`
- `transmission.png`
- `trim.png`
- `year.png`

Each ready file was physically checked as a 1254 x 1254 RGBA PNG with an alpha
channel, transparent corner pixels, and a visible subject on both light and dark
backgrounds. The six generator outputs that originally contained opaque
checkerboard or white backgrounds were recovered with deterministic local
foreground extraction and edge cleanup after approval.

The mounted vehicle Overview maps these assets by stable semantic key rather
than rendered label text. The adjacent label and value carry the accessible
meaning, so the illustrations are decorative in the UI.

## Prompt set

Every asset used this shared prompt shape, with only the subject line changed:

```text
Use case: stylized-concept
Asset type: transparent vehicle-spec UI illustration icon
Input images: supplied July 29 visual as broad style reference only; engine-size.png as the approved style anchor
Primary request: create one original [SUBJECT] icon
Style/medium: polished friendly semi-realistic 3D toy/resin UI illustration with rounded glossy surfaces
Composition/framing: centered three-quarter front view, fully visible, about 76% of a square canvas with even padding
Lighting/mood: soft upper-left studio light and a subtle grounding shadow fading into transparency
Color palette: royal blue #2563EB, charcoal/navy, restrained silver, and one small red accent #E63946
Constraints: genuine transparent alpha, one self-contained subject, no card, tile, text, letters, digits, logo, watermark, scenery, or extra props
```

When the first output contained a baked checkerboard, the built-in editor was
asked to change only that background to genuine alpha while preserving the
subject, materials, camera, lighting, scale, padding, and soft shadow.
