import * as React from "react";
import * as ReactDOM from "react-dom";
import { Form, FormGroup, ControlLabel, FormControl, Button, HelpBlock, InputGroup, Checkbox } from "react-bootstrap";

export interface TopProps {
    defaultUrl?: string,
    minCount?: number,
    ignoreCommon?: boolean
}

export interface TopState {
    url: string,
    count: number,
    ignoreCommon: boolean
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
            ignoreCommon: props.ignoreCommon
        }

        this.handleChange = this.handleChange.bind(this);
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

    handleChange(e: any) {
        this.setState({ url: e.target.value } as TopState);
    }

    handleSubmit() {
        console.log(this.state);
    }

    render() {
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
                            onChange={this.handleChange}
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
                        />
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <Checkbox defaultChecked={this.state.ignoreCommon}>Ignore Common Words</Checkbox>
                </FormGroup>
                <Button onClick={this.handleSubmit}>GO</Button>
            </form>
    </div>);
    }
}