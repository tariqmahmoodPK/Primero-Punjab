import {
  FieldRecord,
  FormSectionRecord,
  TEXT_FIELD
} from "../../../../../../../form";

export const optionsFields = (fieldName, i18n) => ({});

export const optionsForm = (fieldName, i18n, fields = []) =>
  FormSectionRecord({
    unique_id: "field_form_options",
    name: i18n.t("fields.option_strings_text"),
    fields: fields.length
      ? fields
      : Object.values(optionsFields(fieldName, i18n))
  });
