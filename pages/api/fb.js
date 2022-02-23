import { getScreenshot } from "@/lib/og/chromium";

const handler = async (req, res) => {
  const {
    query: { length, hash },
  } = req;

  const f = await getScreenshot(
    process.env.NODE_ENV === "development",
    length,
    hash
  );
  res.setHeader("Content-type", "image/jpeg");
  res.send(f);
};

export default handler;
