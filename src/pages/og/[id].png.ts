import { Buffer } from "buffer";
import satori from "satori";
import sharp from "sharp";
import type { APIContext } from "astro";
import { html } from "satori-html";
import fetchApi from "../../lib/strapi";
import type { Organization } from "../../types";

import baseImageData from "../../../assets/og-image-template.png?arraybuffer";
import fontData from "../../../assets/FOT-TsukuARdGothicStd-B.otf?arraybuffer";

const baseImage = btoa(arrayBufferToBinaryString(baseImageData));

export async function getStaticPaths() {
  const organizations = await fetchApi<Organization[]>({
    endpoint: "organizations?populate=images&populate=tags",
    wrappedByKey: "data",
  });

  return organizations.map((org) => ({
    params: { id: String(org.id) },
    props: { name: org.attributes.name },
  }));
}

export async function GET({ props }: APIContext) {
  const body = await generate(props.name);
  return new Response(body, { headers: { encoding: "binary" } });
}

async function generate(title: string): Promise<Buffer> {
  const svg = await satori(
    html`
      <div
        style="display: flex; width: 1200px; height: 630px; background-size: 1200px 630px; background-image: url(data:image/png;base64,${baseImage});">
        <div
          style="display: flex; justify-content: center; align-items: center; position: absolute; left: 320px; top: 350px; width: 560px; height: 140px; padding: 1rem;">
          <p style="word-break: break-word; color: #f3e9e3; font-size: 3rem; text-overflow: ellipsis;">${title}</p>
        </div>
      </div>
    `,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "FOT-TsukuARdGothicStd-B",
          data: fontData,
        },
      ],
    }
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

function arrayBufferToBinaryString(arrayBuffer: ArrayBuffer) {
  let binaryString = "";
  const bytes = new Uint8Array(arrayBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return binaryString;
}
