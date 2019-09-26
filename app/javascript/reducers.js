import { combineReducers } from "redux-immutable";
import reduceReducers from "reduce-reducers";
import { RECORD_TYPES } from "config";

import * as I18n from "components/i18n";
import * as Login from "components/pages/login";
import * as Flagging from "components/flagging";
import * as SavedSearches from "components/saved-searches";
import * as Nav from "./components/nav";
import * as Dashboard from "./components/pages/dashboard";
import * as Reports from "./components/pages/reports";
import * as PotentialMatches from "./components/pages/potential-matches";
import * as TaskList from "./components/pages/task-list";
import * as RecordForms from "./components/record-form";
import * as ExportList from "./components/pages/export-list";
import * as Filter from "./components/filters";
import * as FiltersBuilder from "./components/filters-builder";
import * as Support from "./components/pages/support";
import * as Notifier from "./components/notifier";
import * as User from "./components/user";
import * as Application from "./components/application";
import * as RecordList from "./components/record-list";

const rootReducer = {
  records: combineReducers({
    ...Object.assign(
      {},
      Object.keys(RECORD_TYPES).reduce((r, i) => {
        const o = r;
        o[i] = reduceReducers(
          RecordList.recordListReducer(i),
          FiltersBuilder.reducers(i)
        );
        return o;
      }, {})
    ),
    ...PotentialMatches.reducers,
    ...TaskList.reducers,
    ...Dashboard.reducers,
    ...Reports.reducers,
    ...ExportList.reducers,
    ...Support.reducers,
    ...Flagging.reducers,
    ...SavedSearches.reducers
  }),
  ui: combineReducers({
    ...Nav.reducers,
    ...I18n.reducers,
    ...Filter.reducers,
    ...Login.reducers
  }),
  ...User.reducers,
  ...RecordForms.reducers,
  ...Notifier.reducers,
  ...Application.reducers
};

export default rootReducer;