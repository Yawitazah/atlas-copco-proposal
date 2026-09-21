# Prospect campaign mockups

These assets are illustrative concepts for a fictional prospect. They are not live Atlas Copco emails, ads, endorsements, platform placements or customer records.

## Fictional sample

- Prospect: Marcus Reed
- Company: Northcrew Site Services
- Application: utility maintenance
- Equipment example: XAS 188 CD
- Example need: 111–189 cfm, up to 100 psi
- Example next step: site walkthrough

## Image-generation method

OpenAI's built-in ImageGen created two original photographic environments. Exact typography, UI framing, the existing equipment cutout and fictional sample data were composited locally with `scripts/render_prospect_mockups.py` so the finished email and platform mockups remain legible and accurate.

### Email-environment prompt

> Use case: ads-marketing. Asset type: wide campaign background for a polished industrial follow-up email. Create a photorealistic premium municipal utility maintenance jobsite at early morning, prepared as the environment for a portable air compressor campaign. Show a clean active site with concrete, subtle utility infrastructure, work trucks and two safety-equipped professionals in the far background. Leave a broad uncluttered product stage in the center-right for a yellow towable compressor to be composited later, and leave darker negative space on the left for exact marketing copy. High-end commercial industrial photography, realistic materials and scale; wide 16:9 landscape, eye-level, cinematic depth; warm early-morning sunlight with cool teal shadows; deep forest green, slate, warm amber and restrained cyan. No portable compressor or generator, text, logos, watermarks, fictional brand marks, distorted people or UI frame.

### Social-environment prompt

> Use case: ads-marketing. Asset type: premium square social advertising background for industrial portable air equipment. Create a photorealistic commercial construction and utility service scene with a prepared open product platform for a yellow towable air compressor to be composited later. The setting should feel active, local and professional, with a pipe-maintenance crew and a compact work vehicle in the middle distance. Add elegant abstract airflow ribbons in restrained cyan and amber sweeping behind the empty product area, suggesting power and air delivery without looking like fantasy. High-end industrial campaign photography with subtle graphical energy accents; square composition with a product stage in the lower center and room for exact headline and CTA; crisp daylight; deep teal, charcoal, construction yellow, warm amber and restrained cyan. No compressor, generator, readable text, logos, watermark, UI frame, distorted people or oversized equipment.

## Files

- `prospect-email-background-v2.png` — generated environment; SHA-256 `33B6F30651E8DB167911805E30707A9BC3AEA79EA95430110C963B78791DF5AC`
- `prospect-social-background-v2.png` — generated environment; SHA-256 `6DAB96828FE8A950022042E599507ADD6BBE6AA564131DDD2F82555EB0280F28`
- `prospect-email-campaign-v2.webp` — desktop finished email; SHA-256 `FA38A7E2B047086BC2C4C7F89A98C8BCA756E0CBB5E634B0BFCE57FE2A621163`
- `prospect-email-campaign-mobile-v2.webp` — phone-readable finished email; SHA-256 `0B0813C9EDFA862756E3E54481C9A1A8FE4809DDD57D8D4F0468EABF467E6106`
- `prospect-social-campaign-v2.webp` — desktop LinkedIn/Instagram/Facebook presentation; SHA-256 `C2BE4E030E54DC4DE7ADA09E964EAD75259E73BEFFB3F11508763A6E2875D900`
- `prospect-social-linkedin-v2.webp` — phone carousel card; SHA-256 `8B43A7A7DFEADFAFE54684E4B19827F6E8B29F2DBDDDB4FBC63FE66E36625B56`
- `prospect-social-instagram-v2.webp` — phone carousel card; SHA-256 `4F84CBB017762913C2D6F0E56F098398942FF04CB131448B3B19F2D1CDFABBB0`
- `prospect-social-facebook-v2.webp` — phone carousel card; SHA-256 `A488687690D0C8EB72D315CAA1F0D9CAFB7AACA6D335DF1C20B3E00ADC1D5F47`

The desktop and phone renderings intentionally use different layouts so message text stays readable rather than shrinking a wide image into a narrow viewport.
