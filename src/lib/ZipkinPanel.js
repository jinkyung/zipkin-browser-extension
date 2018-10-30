import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import ZipkinUI from './zipkinUI';
import matchUrl from './matchUrl';
import ZipkinFilteringOption from './ZipkinFilteringOption';

export default class ZipkinPanel extends Component {
  // static propTypes = {
  //   pubsub: PropTypes.shape({
  //     sub: PropTypes.func().isRequired,
  //   }).isRequired,
  //   themeName: PropTypes.string(),
  // };

  static defaultProps = {
    themeName: 'default',
  };

  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      zipkinUrls: [],
      staticOption: 'off',
      domainOption: '11st.co.kr',
      searchKeyword: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.pubsub.sub(
      'zipkinUrls.status',
      this.handleZipkinUrlsChange.bind(this),
    );
    this.props.pubsub.sub('navigated', () => this.setState({ requests: [] }));
    this.props.pubsub.sub(
      'requestFinished',
      this.handleRequestFinished.bind(this),
    );
  }

  handleRequestFinished(request) {
    const [traceId] = request.headers.filter(
      h => h.name.toLowerCase() === 'x-b3-traceid',
    );
    if (traceId) {
      this.setState({
        requests: [
          ...this.state.requests,
          {
            traceId: traceId.value,
            url: request.url,
          },
        ],
      });
    }
  }

  traceLink(traceId, requestUrl) {
    const url = matchUrl(requestUrl, this.state.zipkinUrls);
    if (url == null) {
      return null;
    }
    return `${url.url}/traces/${encodeURIComponent(traceId)}`;
  }

  handleZipkinUrlsChange(value) {
    this.setState({
      zipkinUrls: value,
    });
  }

  handleChange(e) {
    let nextState = {};
    nextState[e.target.name] = e.target.value;
    this.setState(nextState);
  }

  render() {
    const darkTheme = this.props.themeName === 'dark';
    const textColor = darkTheme ? '#a5a5a5' : '#000';
    const linkColor = darkTheme ? '#66ccff' : undefined;
    const alignLeft = { textAlign: 'left', verticalAlign: 'top' };

    const { staticOption, domainOption, searchKeyword, requests } = this.state;
    let requestsToShow = requests;
    if (staticOption === 'off') {
      requestsToShow = requestsToShow.filter(request =>
        !request.url.includes('.js')
        && !request.url.includes('.html')
        && !request.url.includes('.css')
        && !request.url.includes('.png')
        && !request.url.includes('.jpg')
        && !request.url.includes('.jpeg')
        && !request.url.includes('.gif')
        && !request.url.includes('.bmp')
        && !request.url.includes('.tif')
      );
    }
    if (domainOption) {
      requestsToShow = requestsToShow.filter(request => request.url.split('//')[1].split('/')[0].includes(domainOption));
    }
    if (searchKeyword) {
      requestsToShow = requestsToShow.filter(request => request.url.includes(searchKeyword));
    }

    return (
      <div className="container" style={{ color: textColor }}>
        <div className="row">
          <div className="col-md-12">
            <h2>Zipkin traces</h2>
            <ZipkinUI pubsub={this.props.pubsub} darkTheme={darkTheme} />
            <ZipkinFilteringOption
              staticOption={staticOption}
              domainOption={domainOption}
              searchKeyword={searchKeyword}
              handleChange={this.handleChange}
            />
            {requests.length > 0 ?
              <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                <span style={{ color: '#888', marginRight: '4px' }}>Total Traces:</span>
                <span style={{ fontWeight: 'bold', marginRight: '15px' }}>{requests.length}</span>
                <span style={{ color: '#888', marginRight: '4px' }}>Filtered Traces:</span>
                <span style={{ fontWeight: 'bold' }}>{requestsToShow.length}</span>
              </div> : null}
            <table style={{ marginBottom: '50px' }}>
              <thead>
                <tr>
                  <th style={alignLeft}>Trace</th>
                  <th style={alignLeft}>Request</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requestsToShow.map(request => (
                    <tr key={request.traceId}>
                      <td style={alignLeft}>
                        <a
                          target="blank"
                          style={{ color: linkColor }}
                          href={this.traceLink(request.traceId, request.url)}
                        >
                          {request.traceId}
                        </a>
                      </td>
                      <td style={alignLeft}>{request.url}</td>
                    </tr>
                  ))
                ) : (
                    <tr>
                      <td colSpan="2" style={{ color: '#888' }}>
                        Recording network activity... Perform a request or hit F5
                        to record the reload.
                    </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
