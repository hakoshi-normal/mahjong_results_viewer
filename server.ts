// deno run --watch --allow-net --allow-read --allow-env server.ts
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";


Deno.serve(async (req) => {
  const url_obj = new URL(req.url);
  const path_name = url_obj.pathname;
  const sheet_name = url_obj.searchParams.get('mode');

  if (req.method === "GET" && path_name === "/gameinfos") {

    const sheet_id = Deno.env.get("SHEET_ID");
    const api_key = Deno.env.get("API_KEY");

    const json = fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${sheet_name}?key=${api_key}`,
    );

    let jsonData = await json.then((response) => {
      return response.json();
    });

    let values = jsonData.values;
    return new Response(JSON.stringify(values));
  }


  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});
