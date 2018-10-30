import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import url from 'url';

const protocolRegexp = /https?:\/\//;

export default class ZipkinUI extends Component {
  // static propTypes = {
  //   pubsub: PropTypes.shape({
  //     pub: PropTypes.func().isRequired,
  //     sub: PropTypes.func().isRequired,
  //   }).isRequired,
  //   darkTheme: PropTypes.bool(),
  // };

  static defaultProps = {
    darkTheme: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      zipkinUrl: '',
      zipkinUrls: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleZipkinStatuses = this.handleZipkinStatuses.bind(this);
  }

  componentDidMount() {
    this.props.pubsub.pub('zipkinUrls.load');
    this.props.pubsub.sub('zipkinUrls.status', this.handleZipkinStatuses);
  }

  handleZipkinStatuses(statuses) {
    let zipkinUrls = statuses.filter(o => o.status === 'up');
    this.setState({
      zipkinUrls: zipkinUrls,
    });
  }

  handleSubmit(ev) {
    ev.preventDefault();
    const { zipkinUrl } = this.state;
    this.setState({
      zipkinUrl: '',
    });

    try {
      if (!protocolRegexp.test(zipkinUrl)) {
        alert('The URL must start with http:// or https://');
      } else {
        const parsed = url.parse(zipkinUrl);
        const rebuilt = url.format({
          ...parsed,
          pathname: '',
          query: '',
        });

        this.props.pubsub.pub('zipkinUrls.add', rebuilt);
      }
    } catch (err) {
      alert(`Couldn't parse url: ${err}`);
    }
  }

  handleUrlChange(ev) {
    this.setState({
      zipkinUrl: ev.target.value,
    });
  }

  handleRemoveUrl(removedUrl) {
    this.props.pubsub.pub('zipkinUrls.remove', removedUrl);
  }

  render() {
    const hasZipkinUrls = this.state.zipkinUrls.length > 0;
    const alignLeft = { textAlign: 'left', verticalAlign: 'middle', borderBottom: '1px solid #ddd', padding: '3px 5px' };
    const green = this.props.darkTheme ? '#00e600' : '#009900';
    const red = this.props.darkTheme ? '#e60000' : '#990000';
    const buttonStyle = { width: '80px', fontSize: '14px', marginLeft: '5px', background: 'white', border: '1px solid #ccc', borderRadius: '3px' };

    return (
      <div style={{ width: '600px' }}>
        <div>
          <form id="zipkin-add-ui" onSubmit={this.handleSubmit}>
            <input
              id="zipkin-url"
              type="text"
              value={this.state.zipkinUrl}
              onChange={this.handleUrlChange}
              name="zipkin-url"
              style={{ width: '487px' }}
              placeholder="Enter URL to a Zipkin UI..."
            />
            <input type="submit" value="Add"
              style={buttonStyle}
            />
          </form>
        </div>
        {hasZipkinUrls ? (
          <table style={{ width: '100%', border: '1px solid #ccc', borderCollapse: 'collapse', background: '#f9fafc' }}>
            <thead>
              <tr>
                <th style={alignLeft}>URL</th>
                <th style={alignLeft}>Status</th>
                <th style={alignLeft}>Instrumented sites</th>
                <th style={alignLeft} />
              </tr>
            </thead>
            <tbody>
              {this.state.zipkinUrls.map((zipkinUrl, i) => {
                const status =
                  zipkinUrl.status === 'up'
                    ? '✓'
                    : zipkinUrl.status || 'unknown status';
                const color = zipkinUrl.status === 'up' ? green : red;
                return (
                  <tr key={i}>
                    <td style={{ ...alignLeft, color }}>{zipkinUrl.url}</td>
                    <td style={alignLeft}>{status}</td>
                    <td style={alignLeft}>{zipkinUrl.instrumented}</td>
                    <td style={alignLeft}>
                      <button
                        style={{ ...buttonStyle, fontSize: '12px' }}
                        onClick={() => this.handleRemoveUrl(zipkinUrl.url)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
            <div style={{ color: '#888', marginTop: '-3px', marginLeft: '5px', paddingBottom: '5px' }}>
              You need to add the URL to a Zipkin UI in order to view traces.
          </div>
          )}
      </div>
    );
  }
}
