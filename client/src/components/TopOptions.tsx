import * as React from "react";
import * as ReactDOM from "react-dom";
import { Form, FormGroup, ControlLabel, FormControl, Button, HelpBlock, InputGroup, Checkbox, Grid, Row, Col } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import '../styles/top-options.css';

export interface TopProps {
    defaultUrl?: string,
    url?: string,
    minCount?: number,
    count?: number,
    ignoreCommon?: boolean,
    goCallback?: Function,
    compact?: boolean
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
            url: props.url ? props.url : props.defaultUrl,
            count: props.count ? props.count : props.minCount,
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
        if (this.props.goCallback) {
            let stateCopy: any = {};
            if(this.state.url && this.state.url !== '')
            {
                stateCopy.url = this.state.url;
            }
            else
            {
                stateCopy.url = this.props.defaultUrl;
            }

            stateCopy.count = this.state.count;
            stateCopy.ignoreCommon = this.state.ignoreCommon;

            this.props.goCallback(stateCopy);
        }
        else {
            this.setState({
                redirect: true
            });
        }
    }

    render() {

        if(this.state.redirect)
        {
            var to = '/top/' + this.state.count;
            var search = [];

            if (this.state.url && this.state.url !== '') {
                search.push('url=' + encodeURIComponent(this.state.url));
            }

            if (this.state.ignoreCommon) {
                search.push('ignoreCommon=' + this.state.ignoreCommon)
            }

            return <Redirect push to={{
                pathname: to,
                search: '?' + search.join('&')
            }} />;
        }

        if(!this.props.compact) {
            return (
                <div>
                        <Form className="options-grid">
                            <Grid>
                                <Row>
                                    <Col xsOffset={3} xs={5}>
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
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xsOffset={3} xs={2}>
                                        <FormGroup>
                                            <ControlLabel>COUNT</ControlLabel>
                                            <InputGroup>
                                                <FormControl
                                                    min={this.props.minCount}
                                                    type="number"
                                                    defaultValue={String(this.props.count ? this.props.count : this.props.minCount)}
                                                    onChange={this.handleCountChange}
                                                />
                                            </InputGroup>
                                        </FormGroup>
                                    </Col>
                                    <Col xs={3}>
                                        <FormGroup className="options-cb">
                                            <Checkbox
                                                defaultChecked={this.state.ignoreCommon}
                                                onChange={this.handleCheckedChange}>Ignore Common Words</Checkbox>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xsOffset={5} xs={2}>
                                        <Button bsStyle="success" onClick={this.handleSubmit}>GO</Button>
                                    </Col>
                                </Row>
                            </Grid>
                        </Form>
                </div>);
            }
            else
            {
                return (
                <div>
                        <Form>
                            <Grid>
                                <Row>
                                    <Col xs={5}>
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
                                    </Col>
                                    <Col xs={3}>
                                        <FormGroup bsSize="small">
                                            <ControlLabel>COUNT</ControlLabel>
                                            <InputGroup>
                                                <FormControl
                                                    min={this.props.minCount}
                                                    type="number"
                                                    defaultValue={String(this.props.count ? this.props.count : this.props.minCount)}
                                                    onChange={this.handleCountChange}
                                                />
                                            </InputGroup>
                                        </FormGroup>
                                    </Col>
                                    <Col xs={2}>
                                        <FormGroup className="options-cb">
                                            <Checkbox
                                                defaultChecked={this.state.ignoreCommon}
                                                onChange={this.handleCheckedChange}>Ignore Common</Checkbox>
                                        </FormGroup>
                                    </Col>
                                    <Col xs={1}>
                                        <Button className="options-cb" bsStyle="success" onClick={this.handleSubmit}>GO</Button>
                                    </Col>
                                </Row>
                            </Grid>
                        </Form>
                </div>);
            }
        }
    
}