import React, { useEffect, useImperativeHandle, useRef } from "react";
import PropTypes from "prop-types";
import { batch, useSelector, useDispatch } from "react-redux";
import { FormContext, useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/styles";

import { selectDialog } from "../../../../../record-actions/selectors";
import { setDialog } from "../../../../../record-actions/action-creators";
import bindFormSubmit from "../../../../../../libs/submit-form";
import { submitHandler, whichFormMode } from "../../../../../form";
import FormSection from "../../../../../form/components/form-section";
import { useI18n } from "../../../../../i18n";
import ActionDialog from "../../../../../action-dialog";
import { compare } from "../../../../../../libs";
import { getSelectedField } from "../../selectors";
import { updateSelectedField } from "../../action-creators";

import styles from "./styles.css";
import { getFormField, transformValues, toggleHideOnViewPage } from "./utils";
import { NAME, ADMIN_FIELDS_DIALOG } from "./constants";

const Component = ({ mode, onClose, onSuccess }) => {
  const css = makeStyles(styles)();
  const formMode = whichFormMode(mode);
  const openFieldDialog = useSelector(state =>
    selectDialog(ADMIN_FIELDS_DIALOG, state)
  );
  const i18n = useI18n();
  const formRef = useRef();
  const dispatch = useDispatch();
  const selectedField = useSelector(state => getSelectedField(state), compare);
  const { forms: fieldsForm, validationSchema } = getFormField({
    field: selectedField,
    i18n,
    mode: formMode,
    css
  });

  const formMethods = useForm({ validationSchema });

  const handleClose = () => {
    if (onClose) {
      onClose();
    }

    dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
  };

  const modalProps = {
    confirmButtonLabel: i18n.t("buttons.update"),
    confirmButtonProps: {
      color: "primary",
      variant: "contained",
      autoFocus: true
    },
    cancelButtonProps: {
      color: "primary",
      variant: "contained",
      className: css.cancelButton
    },
    dialogTitle: i18n.t("fields.edit_label"),
    open: openFieldDialog,
    successHandler: () => bindFormSubmit(formRef),
    cancelHandler: () => {
      handleClose();
    },
    omitCloseAfterSuccess: true
  };

  const onSubmit = data => {
    const fieldName = selectedField.get("name");
    const fieldData =
      data[fieldName].hide_on_view_page !== undefined
        ? toggleHideOnViewPage(fieldName, data[fieldName])
        : data;

    batch(() => {
      onSuccess(fieldData);
      dispatch(updateSelectedField(fieldData));
      handleClose();
    });
  };

  const renderForms = () =>
    fieldsForm.map(formSection => (
      <FormSection formSection={formSection} key={formSection.unique_id} />
    ));

  useEffect(() => {
    if (selectedField?.size) {
      formMethods.reset(
        toggleHideOnViewPage(
          selectedField.get("name"),
          transformValues(selectedField.toJS())
        )
      );
    }
  }, [selectedField]);

  useImperativeHandle(
    formRef,
    submitHandler({
      dispatch,
      formMethods,
      formMode,
      i18n,
      initialValues: {},
      onSubmit
    })
  );

  useEffect(() => {
    return () => {
      dispatch(setDialog({ dialog: ADMIN_FIELDS_DIALOG, open: false }));
    };
  }, []);

  return (
    <ActionDialog {...modalProps}>
      <FormContext {...formMethods} formMode={formMode}>
        <form className={css.fieldDialog}>{renderForms()}</form>
      </FormContext>
    </ActionDialog>
  );
};

Component.displayName = NAME;

Component.propTypes = {
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default Component;