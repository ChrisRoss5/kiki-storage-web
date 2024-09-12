// https://firebase.google.com/docs/functions/typescript
// https://cloud.google.com/scheduler/docs/tut-gcf-http
// https://cloud.google.com/scheduler/docs/configuring/cron-job-schedules#defining_the_job_schedule

// https://console.cloud.google.com/cloudscheduler?project=dropbox-clone-716f7
// https://console.cloud.google.com/run/detail/us-central1/emptybins/logs?authuser=0&hl=en&project=dropbox-clone-716f7
// https://console.cloud.google.com/functions/details/us-central1/emptyBins?project=dropbox-clone-716f7&hl=en&authuser=0
// https://console.cloud.google.com/iam-admin/iam?project=dropbox-clone-716f7&supportedpurview=project

import { cert, initializeApp } from "firebase-admin/app";
import { deleteAccount } from "./account";
import { emptyBins } from "./bins";
import * as serviceAccount from "./service-account.json";

initializeApp({
  credential: cert(serviceAccount as any),
  databaseURL:
    "https://dropbox-clone-716f7-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "dropbox-clone-716f7.appspot.com",
  projectId: "dropbox-clone-716f7",
});

export { deleteAccount, emptyBins };
