/* eslint-disable no-console */
import server from "./src/app";

const port = process.env.PORT || 5000;
// if you want to deploy to production, you can uncomment the line below and then comment out the line above
// const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
