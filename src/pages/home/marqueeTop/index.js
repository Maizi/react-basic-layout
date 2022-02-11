import React, { Component } from 'react';
import './index.less';

class MarqueeTop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeList: this.props.list,
      animate: false,
    };
  }

  componentDidMount() {
    this._mouted = true;
  }

  componentWillReceiveProps(nexProps) {
    this.setState({
      animate: false,
    });
    if (JSON.stringify(nexProps.list) != JSON.stringify(this.props.list)) {
      this.timeout = setTimeout(() => {
        if (this._mouted) {
          this.setState({
            animate: true,
          });
        }
      }, 30);
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
    this._mouted = false;
  }

  render() {
    const { animate } = this.state;

    return (
      <div className='marquee-top-page'>
        <div className='marquee-top-wrapper'>
          <ul className={animate ? 'marquee-top-ami' : ''}>
            {this.props.list.map((item, index) => {
              return (
                <li className='flex-horizontal flex-align-center' key={index}>
                  <span className='user-name'>{item.nickname}</span>
                  <span className='static-tit ellip'>
                    通过{item.case_name}获得
                  </span>
                  <span className='goods-name ellip'>{item.item_name}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default MarqueeTop;
