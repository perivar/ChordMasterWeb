// app/routes/action/get-pdf.tsx
import { renderToStream } from "@react-pdf/renderer";
import { ActionFunction } from "@remix-run/node";

import SongPDFRender from "~/components/SongPDFRender";
import SongTransformer from "~/components/SongTransformer";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();
  const chordpro = formData.get("chordpro")?.toString();
  const transpose = formData.get("transpose")?.toString();
  const font = formData.get("font")?.toString();

  // render the PDF as a stream so you do it async
  const stream = await renderToStream(
    <SongTransformer
      chordProSong={chordpro}
      transposeDelta={Number(transpose)}
      showTabs={false}>
      {songProps => (
        <SongPDFRender
          song={songProps.transformedSong}
          fontSize={Number(font)}
        />
      )}
    </SongTransformer>
  );

  // and transform it to a Buffer to send in the Response
  const body: Buffer = await new Promise((resolve, reject) => {
    const buffers: Uint8Array[] = [];
    stream.on("data", data => {
      buffers.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on("error", reject);
  });

  // finally create the Response with the correct Content-Type header for a PDF
  const headers = new Headers({ "Content-Type": "application/pdf" });
  return new Response(body, { status: 200, headers });
};
