import * as React from "react";
import * as ReactDOM from "react-dom";
import { Form, FormGroup, ControlLabel, FormControl, Button, HelpBlock, InputGroup, Checkbox } from "react-bootstrap";
import { Redirect } from "react-router-dom";

export interface TopProps {
    defaultUrl?: string,
    minCount?: number,
    ignoreCommon?: boolean
}

export interface TopState {
    url: string,
    count: number,
    ignoreCommon: boolean,
    redirect: boolean
}

export class TopOptions extends React.Component<TopProps, TopState> {

    constructor(props: TopProps) {
        super(props);

        if(props.minCount < 1)
        {
            props.minCount = 1;
        }

        this.state = {
            url: props.defaultUrl,
            count: props.minCount,
            ignoreCommon: props.ignoreCommon,
            redirect: false
        }

        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.handleCountChange = this.handleCountChange.bind(this);
        this.handleCheckedChange = this.handleCheckedChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    public static defaultProps: Partial<TopProps> = {
        defaultUrl: "http://terriblytinytales.com/test.txt",
        minCount: 1,
        ignoreCommon: true
    }

    isUrlValid() {
        var urlRegex = /^https?:\/\/[^\s\/$.?#].[^\s]*$/g;
        const length = this.state.url.length;
        if (urlRegex.test(this.state.url)) return 'success';
        else if (length > 0) return 'warning';
        return null;
    }

    handleUrlChange(e: any) {
        this.setState({ url: e.target.value } as TopState);
    }

    handleCountChange(e: any) {
        this.setState({ count: e.target.value });
    }

    handleCheckedChange(e: any) {
        this.setState({ ignoreCommon: e.target.checked });
    }

    handleSubmit() {
        this.setState({
            redirect: true
        });
    }

    render() {
        if(this.state.redirect) {
            var to = '/top/' + this.state.count;
            var search = [];

            if(this.state.url && this.state.url !== '') {
                search.push('url=' + encodeURIComponent(this.state.url));
            }

            if(this.state.ignoreCommon) {
                search.push('ignoreCommon=' + this.state.ignoreCommon)
            }

            return <Redirect push to = {{
                pathname: to,
                search: '?' + search.join('&')
            }} />;
        }
    return (
    <div>
            <form>
                <FormGroup
                    controlId="formBasicText"
                    validationState={this.isUrlValid()}
                >
                    <ControlLabel>URL</ControlLabel>
                    <InputGroup>
                        <InputGroup.Addon>//</InputGroup.Addon>
                        <FormControl
                            type="text"
                            value={this.state.url}
                            placeholder={this.props.defaultUrl}
                            onChange={this.handleUrlChange}
                        />
                    </InputGroup>
                    <FormControl.Feedback />
                    {this.isUrlValid() === 'warning' && 
                        <HelpBlock>Invalid URL. Getting contents may fail.</HelpBlock>
                    }
                </FormGroup>
                <FormGroup>
                    <ControlLabel>COUNT</ControlLabel>
                    <InputGroup>
                        <FormControl 
                        min={this.props.minCount}
                        type="number"
                        defaultValue={String(this.props.minCount)}
                        onChange={this.handleCountChange}
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <Checkbox 
                    defaultChecked={this.state.ignoreCommon}
                    onChange={this.handleCheckedChange}>Ignore Common Words</Checkbox>
                </FormGroup>
                <Button onClick={this.handleSubmit}>GO</Button>
            </form>
    </div>);
    }
}