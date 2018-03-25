import * as React from "react";
import * as ReactDOM from "react-dom";
import { Redirect, Route, Switch, BrowserRouter } from "react-router-dom";
import { TopOptions } from "./components/TopOptions";
import { TopTable } from "./components/TopTable";

export class Index extends React.Component<{}, {}> {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => {
                        return (
                            <Redirect to="/top"/>
                        )
                    }} />
                    <Route exact path="/top" component={TopOptions} />
                    <Route path="/top/:count" component={TopTable} />
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(
    <Index/>,
    document.getElementById("example")
);