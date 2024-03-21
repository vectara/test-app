import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const URL = `https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/metadata`;

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  return axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    })
    .then((fetchRes) => {
      return res.status(200).json(fetchRes.data);
    });
}
