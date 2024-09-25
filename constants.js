const path = require("path");

const FRONTEND_PROJECT_PATH = path.join(
  __dirname,
  "../project/mymedic/erp_fe/src"
);
const BACKEND_PROJECT_PATH = path.join(
  __dirname,
  "../project/mymedic/erp_be/src"
);

const PDF_OUTPUT_FE_FOLDER = path.join(__dirname, "pdf", "fe");
const PDF_OUTPUT_BE_FOLDER = path.join(__dirname, "pdf", "be");

module.exports = {
  FRONTEND_PROJECT_PATH,
  BACKEND_PROJECT_PATH,
  PDF_OUTPUT_FE_FOLDER,
  PDF_OUTPUT_BE_FOLDER,
};
