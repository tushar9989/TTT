import * as React from 'react';
import { Table, ProgressBar, Pagination } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import * as $ from 'jquery';

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
            pageSize: 20
        };

        this.handlePageClick = this.handlePageClick.bind(this);
    }

    componentDidMount() {
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

        if(this.state.loading) {
            return <ProgressBar active now={100} />;
        }

        if(this.state.error) {
            return <div>{this.state.error}</div>
        }

        var table = this.getTable(this.state);

        var pagination = this.getPagination(this.state.pageNo, this.state.pageSize, this.state.data.length);

        return (
            <div>
                {table}
                {pagination}
            </div>
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
        let items = [];
        let lastIndex = Math.floor(max / pageSize);

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
                <Pagination bsSize="small">{items}</Pagination>
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

        return (
            <div>
                <Table bordered condensed hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Word</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) =>
                            <tr key={i}>
                                <td key="1">{((state.pageNo - 1) * state.pageSize) + i + 1}</td>
                                <td key="2">{row.word}</td>
                                <td key="3">{row.count}</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        );
    }
}