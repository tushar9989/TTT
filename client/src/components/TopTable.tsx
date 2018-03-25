import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

// Define what your match should look like
interface TopTableMatch {
    count: number;
}

interface TopTableParentProps { }

type TopTableProps = TopTableParentProps &
    RouteComponentProps<TopTableMatch>;

export class TopTable extends React.Component<TopTableProps> {
    render() {
        return (
            <div>{this.props.match.params.count}</div>
        );
    }
}