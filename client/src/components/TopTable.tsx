import * as React from 'react';
import { Table, ProgressBar, Pagination, Grid, Row, Col } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import * as $ from 'jquery';
import { TopOptions, TopState } from './TopOptions';
import '../styles/top-table.css';

// Define what your match should look like
interface TopTableMatch {
    count: number;
}

interface TopTableParentProps { }

type TopTableProps = TopTableParentProps &
    RouteComponentProps<TopTableMatch>;

export interface TopTableState {
    url: string,
    count: number,
    ignoreCommon: boolean,
    data: Array<any>,
    loading: boolean,
    error?: string,
    pageNo: number,
    pageSize: number
}

export class TopTable extends React.Component<TopTableProps, TopTableState> {

    constructor(props: TopTableProps) {
        super(props);

        let parsedParams: any = {};
        var queryParams = props.location.search.substring(1).split('&');
        for(var i = 0; i < queryParams.length; i++)
        {
            var keyAndValue = queryParams[i].split('=');
            parsedParams[keyAndValue[0]] = decodeURIComponent(keyAndValue[1]);
        }

        if (this.props.match.params.count < 1)
        {
            this.props.match.params.count = 1;
        }

        this.state = {
            url: parsedParams.url === undefined ? 'http://terriblytinytales.com/test.txt' : parsedParams.url,
            count: this.props.match.params.count,
            ignoreCommon: parsedParams.ignoreCommon === undefined ? true : parsedParams.ignoreCommon,
            data: [],
            loading: true,
            pageNo: 1,
            pageSize: 10
        };

        this.handlePageClick = this.handlePageClick.bind(this);
        this.goCallback = this.goCallback.bind(this);
    }

    goCallback(state: TopState) {
        this.setState({
            url: state.url,
            count: state.count,
            ignoreCommon: state.ignoreCommon
        }, () => this.loadTableData());
        this.props.history.push(state.count + '?url=' + encodeURIComponent(state.url) + '&ignoreCommon=' + state.ignoreCommon);
    }

    componentDidMount() {
        this.loadTableData();
    }

    loadTableData() {
        this.setState({
            loading: true,
            error: undefined
        })
        var endpoint = '/api/top/' + this.state.count;
        $.ajax({
            url: endpoint,
            dataType: 'json',
            data: {
                url: this.state.url,
                ignoreCommon: this.state.ignoreCommon
            },
            success: (response: any) => {
                this.setState({
                    data: response.data,
                    loading: false
                });
            },
            error: (data: any) => {
                this.setState({
                    error: data.responseJSON.message,
                    loading: false
                })
            }
        });
    }

    render() {

        var table, pagination;
        if(this.state.loading) {
            table = <Grid className="loading-container">
                <Row>
                    <Col xsOffset={2} xs={8}>
                        <ProgressBar active now={100} />
                    </Col>
                </Row>
            </Grid>;

            pagination = null;
        }
        else
        {
            table = this.getTable(this.state);

            pagination = this.getPagination(this.state.pageNo, this.state.pageSize, this.state.data.length);
        }

        return (
            <Grid className="table-container">
                <Row>
                    <Col xs = {12}>
                        <TopOptions count={this.state.count} url={this.state.url} ignoreCommon={this.state.ignoreCommon} goCallback={this.goCallback} compact={true} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {table}
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        {pagination}
                    </Col>
                </Row>
            </Grid>
        );
    }

    handlePageClick(e: any) {
        let targetPage = e.target.innerHTML;

        if (targetPage === '‹')
        {
            targetPage = this.state.pageNo - 1;
        }
        else if (targetPage === '›')
        {
            targetPage = this.state.pageNo + 1;
        }
        else
        {
            targetPage = parseInt(targetPage);
        }

        this.setState({
            pageNo: targetPage
        });
    }

    getPagination(pageNo: number, pageSize: number, max: number) {
        if(this.state.error || this.state.data.length === 0) {
            return null;
        } 
        let items = [];
        let lastIndex = Math.floor(max / pageSize);
        if(lastIndex <= 1)
        {
            return null;
        }

        if(pageNo !== 1)
        {
            items.push(<Pagination.Prev onClick={this.handlePageClick} key="prev" />);
        }

        if(lastIndex <= 10)
        {
            for (let number = 1; number <= lastIndex; number++) {
                let item = <Pagination.Item onClick={this.handlePageClick} key={number} active={number === pageNo}>{number}</Pagination.Item>;
                items.push(item);
            }
        }
        else
        {
            let left = pageNo - 3;
            let right = pageNo + 3;
            let addRight = false;

            if(left < 1)
            {
                while (left < 1) {
                    left++;
                    right++;
                }
            }
            else if(left !== 1)
            {
                items.push(<Pagination.Item onClick={this.handlePageClick} key="1">{1}</Pagination.Item>);
                items.push(<Pagination.Ellipsis key="ell-prev" />);
            }

            if(right > lastIndex)
            {
                while (right > lastIndex) {
                    left--;
                    right--;
                }
            }
            else if(right !== lastIndex)
            {
                addRight = true;
            }

            for (let number = left; number <= right; number++) {
                let item = <Pagination.Item onClick={this.handlePageClick} key={number} active={number === pageNo}>{number}</Pagination.Item>;
                items.push(item);
            }

            if(addRight)
            {
                items.push(<Pagination.Ellipsis key="ell-next" />);
                items.push(<Pagination.Item onClick={this.handlePageClick} key={lastIndex}>{lastIndex}</Pagination.Item>);
            }
        }
        
        if(pageNo !== lastIndex)
        {
            items.push(<Pagination.Next onClick={this.handlePageClick} key="next" />);
        }

        return (
            <div>
                <Pagination className="pagination-container" bsSize="small">{items}</Pagination>
            </div>
        );
    }

    getTable(state: TopTableState) {
        var data;
        if (state.data) {
            data = state.data;

            var start = (state.pageNo - 1) * state.pageSize;

            data = data.slice(start, start + state.pageSize);
        }
        else {
            data = [];
        }

        var tbody;
        if (this.state.error) {
            tbody = <tr key="error"><td key="nd-elem" colSpan={3} className="error-row">{this.state.error}</td></tr>;
        }
        else if(data.length > 0)
        {
            tbody = data.map((row, i) =>
                <tr key={i}>
                    <td key="1">{((state.pageNo - 1) * state.pageSize) + i + 1}</td>
                    <td key="2">{row.word}</td>
                    <td key="3">{row.count}</td>
                </tr>
            );
        }
        else
        {
            tbody = <tr key="error"><td key="nd-elem" colSpan={3} className="no-data-row">No Data Found</td></tr>;
        }

        return (
            <div>
                <Table hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Word</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tbody}
                    </tbody>
                </Table>
            </div>
        );
    }
}