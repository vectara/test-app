import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const URL = `https://api.netlify.com/api/v1/purge`;

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  return axios
    .post(
      URL,
      { site_id: process.env.NETLIFY_SITE_ID },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
    )
    .then(() => {
      return res.status(200).json({ message: "success" });
    });
}
