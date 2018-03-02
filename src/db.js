import Cloudant from "cloudant";

export default callback => {
  // obtain cloudant_url from env
  const cloudant_url = process.env.CLOUDANT_URL;

  // connect to cloudant db
  const db = Cloudant(cloudant_url);

  //return a callback with db
  callback(db);
};
