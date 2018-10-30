import React, { Component } from 'react';


export default class ZipkinFilteringOption extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { staticOption, domainOption, searchKeyword, handleChange } = this.props;
        const pStyle = { padding: '3px 5px' };
        const labelStyle = { width: '120px', color: '#888', display: 'inline-block', verticalAlign: 'middle' };
        const contentStyle = { display: 'inline-block', verticalAlign: 'middle' }
        return (
            <div style={{ width: '600px', border: '1px solid #ccc', marginBottom: '10px', background: '#f9fafc' }}>
                <div style={{ padding: '3px 5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Filtering Options</div>
                <div style={pStyle}>
                    <span style={labelStyle}>Static Resource</span>
                    <span style={contentStyle}>
                        <input
                            type="radio"
                            name="staticOption"
                            value="off"
                            id="staticOption_off"
                            onChange={handleChange}
                            checked={staticOption === "off"}
                        />
                        <label htmlFor="staticOption_off" style={{ marginRight: '10px' }}>Hide</label>
                        <input
                            type="radio"
                            name="staticOption"
                            value="on"
                            id="staticOption_on"
                            onChange={handleChange}
                            checked={staticOption === "on"}
                        />
                        <label htmlFor="staticOption_on">Show</label>
                    </span>
                </div>
                <div style={pStyle}>
                    <span style={labelStyle}>Domain Filter</span>
                    <span style={contentStyle}>*.<input name="domainOption" type="text" value={domainOption} style={{ width: '190px' }} onChange={handleChange} /></span>
                </div>
                <div style={{ ...pStyle, marginBottom: '3px' }}>
                    <span style={labelStyle}>Search</span>
                    <span style={contentStyle}><input name="searchKeyword" type="text" placeholder="Enter Filtering Keyword..." value={searchKeyword} style={{ width: '200px' }} onChange={handleChange} /></span>
                </div>
            </div>
        )

    }
}