import { namespaceActions } from "../../../libs";

import NAMESPACE from "./namespace";

const actions = namespaceActions(NAMESPACE, [
  "ASSIGN_USERS_FETCH",
  "ASSIGN_USERS_FETCH_SUCCESS",
  "CLEAR_ERRORS",
  "ASSIGN_USER_SAVE",
  "ASSIGN_USER_SAVE_SUCCESS",
  "ASSIGN_USER_SAVE_STARTED",
  "ASSIGN_USER_SAVE_FAILURE",
  "ASSIGN_USER_SAVE_FINISHED",
  "REFERRAL_USERS_FETCH_STARTED",
  "REFERRAL_USERS_FETCH_FINISHED",
  "REFERRAL_USERS_FETCH",
  "REFERRAL_USERS_FETCH_SUCCESS",
  "REFERRAL_USER",
  "REFERRAL_USER_SUCCESS",
  "REFERRAL_USER_STARTED",
  "REFERRAL_USER_FAILURE",
  "REFER_USER",
  "REFER_USER_SUCCESS",
  "REFER_USER_STARTED",
  "REFER_USER_FAILURE",
  "TRANSFER_USERS_FETCH",
  "TRANSFER_USERS_FETCH_SUCCESS",
  "TRANSFER_USER",
  "TRANSFER_USER_SUCCESS",
  "TRANSFER_USER_STARTED",
  "TRANSFER_USER_FAILURE",
  "SERVICE_REFERRED_SAVE"
]);

export default {
  ...actions,
  USERS_ASSIGN_TO: "users/assign-to",
  USERS_TRANSFER_TO: "users/transfer-to",
  USERS_REFER_TO: "users/refer-to",
  CASES_ASSIGNS: "cases/assigns",
  CASES_TRANSFERS: "cases/transfers",
  CASES_REFERRALS: "cases/referrals"
};
