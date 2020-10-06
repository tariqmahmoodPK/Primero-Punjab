import { fromJS } from "immutable";
import { object, string, bool } from "yup";

import {
  FieldRecord,
  FormSectionRecord,
  TICK_FIELD,
  TEXT_AREA,
  SELECT_FIELD,
  TEXT_FIELD,
  OPTION_TYPES,
  HIDDEN_FIELD
} from "../../../form";
import { fetchReferralUsers } from "../action-creators";
import { fetchManagedRoles } from "../../../application/action-creators";
import { RECORD_TYPES } from "../../../../config";

import ConsentProvided from "./components/consent-provided";
import {
  FIELDS,
  TRANSITIONED_TO_ASYNC_FILTER_FIELDS,
  STATE_REFERRAL_LOADING_PATH,
  STATE_REFERRAL_USERS_PATH
} from "./constants";

const commonHandleWatched = {
  handleWatchedInputs: ({ [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: consent }) => ({ disabled: !consent })
};

const localReferralFields = ({ i18n, recordType, isReferralFromService }) =>
  [
    {
      display_name: i18n.t("transfer.agency_label"),
      name: FIELDS.AGENCY,
      type: SELECT_FIELD,
      option_strings_source: OPTION_TYPES.AGENCY,
      watchedInputs: [FIELDS.REMOTE],
      showIf: values => !values[FIELDS.REMOTE],
      clearDependentValues: [FIELDS.TRANSITIONED_TO],
      option_strings_source_id_key: "unique_id",
      order: 5
    },
    {
      display_name: i18n.t("transfer.location_label"),
      name: FIELDS.LOCATION,
      type: SELECT_FIELD,
      watchedInputs: [FIELDS.REMOTE, FIELDS.TRANSITIONED_TO],
      showIf: values => !values[FIELDS.REMOTE],
      option_strings_source: OPTION_TYPES.REPORTING_LOCATIONS,
      clearDependentValues: [FIELDS.TRANSITIONED_TO],
      order: 6
    },
    {
      display_name: i18n.t("transfer.recipient_label"),
      name: FIELDS.TRANSITIONED_TO,
      type: SELECT_FIELD,
      required: true,
      showIf: values => !values[FIELDS.REMOTE],
      watchedInputs: [FIELDS.SERVICE, FIELDS.AGENCY, FIELDS.LOCATION, FIELDS.REMOTE],
      asyncOptions: true,
      asyncAction: fetchReferralUsers,
      asyncParams: { record_type: RECORD_TYPES[recordType] },
      asyncParamsFromWatched: TRANSITIONED_TO_ASYNC_FILTER_FIELDS,
      asyncOptionsLoadingPath: STATE_REFERRAL_LOADING_PATH,
      option_strings_source: OPTION_TYPES.REFER_TO_USERS,
      setOtherFieldValues: [
        {
          field: FIELDS.LOCATION,
          path: STATE_REFERRAL_USERS_PATH,
          key: "location"
        },
        {
          field: FIELDS.AGENCY,
          path: STATE_REFERRAL_USERS_PATH,
          key: "agency"
        }
      ],
      order: 7
    }
  ].map(field => {
    field.watchedInputs.push(FIELDS.CONSENT_INDIVIDUAL_TRANSFER);

    return {
      internalFormFieldID: "local",
      disabled: isReferralFromService,
      handleWatchedInputs: ({ [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: consent }) => ({
        ...(!isReferralFromService && { disabled: !consent })
      }),
      ...field
    };
  });

const remoteReferralFields = ({ i18n, isExternalReferralFromService }) =>
  [
    {
      display_name: i18n.t("referral.type_of_recipient"),
      name: FIELDS.ROLE,
      type: SELECT_FIELD,
      option_strings_source: OPTION_TYPES.ROLE_EXTERNAL_REFERRAL,
      asyncOptions: true,
      asyncAction: fetchManagedRoles,
      asyncOptionsLoadingPath: ["application", "loading"],
      asyncParamsFromWatched: [],
      required: true,
      ...commonHandleWatched,
      order: 3
    },
    {
      display_name: i18n.t("transfer.agency_label"),
      name: FIELDS.AGENCY,
      order: 9
    },
    {
      display_name: i18n.t("transfer.location_label"),
      name: FIELDS.LOCATION,
      order: 10
    },
    {
      display_name: i18n.t("transfer.recipient_label"),
      name: FIELDS.TRANSITIONED_TO_REMOTE,
      order: 11
    }
  ].map(field => {
    return {
      internalFormFieldID: "remote",
      type: TEXT_FIELD,
      disabled: isExternalReferralFromService,
      watchedInputs: [FIELDS.REMOTE, FIELDS.CONSENT_INDIVIDUAL_TRANSFER],
      handleWatchedInputs: ({ [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: consent }) => ({
        ...(!isExternalReferralFromService && { disabled: !consent })
      }),
      showIf: values => values[FIELDS.REMOTE],
      ...field
    };
  });

const commonReferralFields = ({ isReferralFromService, isExternalReferralFromService, i18n }) =>
  [
    {
      display_name: i18n.t("transfer.is_remote_label"),
      name: FIELDS.REMOTE,
      type: TICK_FIELD,
      disabled: isReferralFromService,
      showIf: () => !isReferralFromService || isExternalReferralFromService,
      order: 2
    },
    {
      display_name: i18n.t("referral.service_label"),
      name: FIELDS.SERVICE,
      type: SELECT_FIELD,
      option_strings_source: OPTION_TYPES.SERVICE_TYPE,
      disabled: isReferralFromService,
      clearDependentValues: [FIELDS.TRANSITIONED_TO],
      order: 4
    },
    {
      display_name: i18n.t("transfer.notes_label"),
      name: FIELDS.NOTES,
      type: TEXT_AREA,
      disabled: false,
      ...commonHandleWatched,
      order: 99
    }
  ].map(field => {
    return {
      watchedInputs: [FIELDS.CONSENT_INDIVIDUAL_TRANSFER],
      handleWatchedInputs: ({ [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: consent }) => ({
        ...(!isReferralFromService && { disabled: !consent })
      }),
      ...field
    };
  });

const referralFields = args =>
  [
    {
      name: FIELDS.SERVICE_RECORD_ID,
      type: HIDDEN_FIELD,
      order: 0
    },
    {
      display_name: args.i18n.t("referral.refer_anyway_label"),
      name: FIELDS.CONSENT_INDIVIDUAL_TRANSFER,
      type: TICK_FIELD,
      wrapWithComponent: ConsentProvided,
      showIf: () => !args.providedConsent,
      order: 1
    },
    ...commonReferralFields(args),
    ...localReferralFields(args),
    ...remoteReferralFields(args)
  ]
    .sort((fieldA, fieldB) => fieldA.order - fieldB.order)
    .map(field => FieldRecord(field));

const validWhenRemote = (isRemote, i18n, i18nKey = "") =>
  string().when(FIELDS.REMOTE, {
    is: value => value === isRemote,
    then: string().required(i18n.t(`referral.${i18nKey}`))
  });

export const validations = i18n =>
  object().shape({
    [FIELDS.CONSENT_INDIVIDUAL_TRANSFER]: bool().oneOf([true]),
    [FIELDS.ROLE]: validWhenRemote(true, i18n, "type_of_referral_required").nullable(),
    [FIELDS.TRANSITIONED_TO]: validWhenRemote(false, i18n, "user_mandatory_label").nullable()
  });

export const form = args => {
  return fromJS([
    FormSectionRecord({
      unique_id: "referrals",
      fields: referralFields(args)
    })
  ]);
};
