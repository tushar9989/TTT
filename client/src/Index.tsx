import * as React from "react";
import * as ReactDOM from "react-dom";
import { Redirect, Route, Switch, BrowserRouter } from "react-router-dom";
import { Top } from "./components/Top";

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
                    <Route path="/top" component={Top} />
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(
    <Index/>,
    document.getElementById("example")
);