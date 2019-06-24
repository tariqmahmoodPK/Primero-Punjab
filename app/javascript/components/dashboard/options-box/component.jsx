import React from "react";
import PropTypes from "prop-types";
import { Card, CardHeader, CardContent } from "@material-ui/core";
import {
  createMuiTheme,
  MuiThemeProvider,
  useTheme
} from "@material-ui/core/styles";
import clsx from "clsx";
import makeStyles from "@material-ui/styles/makeStyles";
import styles from "./styles.css";

const OptionsBox = ({ title, action, children, classes, themes }) => {
  const getMuiTheme = () =>
    createMuiTheme({
      overrides: {
        MuiCardHeader: {
          root: {
            padding: "14px 16px 0 16px"
          }
        },
        MuiCardContent: {
          root: {
            padding: "0",
            "&:last-child": {
              paddingBottom: "0"
            }
          }
        },
        MuiTypography: {
          h5: {
            fontWeight: "bold",
            fontSize: "17px",
            color: "#231E1F",
            textTransform: "uppercase"
          }
        },
        ...themes
      }
    });

  const css = makeStyles(styles)();
  const cssOverrides = makeStyles(classes || {})();

  return (
    <MuiThemeProvider theme={{ ...useTheme(), ...getMuiTheme() }}>
      <Card
        className={clsx(
          css.CardShadow,
          css.OptionsBox,
          cssOverrides.CardShadow,
          cssOverrides.OptionsBox
        )}
      >
        <CardHeader action={action} title={title} />
        <CardContent>{children}</CardContent>
      </Card>
    </MuiThemeProvider>
  );
};

OptionsBox.propTypes = {
  title: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node,
  classes: PropTypes.object,
  themes: PropTypes.object
};

export default OptionsBox;
