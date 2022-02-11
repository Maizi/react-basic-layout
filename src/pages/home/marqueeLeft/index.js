import React, { Component } from 'react';
import './index.less';

let marqueeLeftTimer = null,
  marqueeLeftIntervel = null;
class MarqueeLeft extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    marqueeLeftTimer = setTimeout(() => {
      let hasWrap =
        document.getElementById('marquee-wrap') &&
        document.getElementById('marquee-node');
      if (hasWrap) {
        let wrapw = document.getElementById('marquee-wrap').offsetWidth;
        let nodew = document.getElementById('marquee-node').offsetWidth;
        if (wrapw < nodew) {
          //判断文字长度大于盒子宽度时，执行滚动
          this.move();
        }
        clearTimeout(marqueeLeftTimer);
      }
    }, 2000);
  }

  componentWillUnmount() {
    clearTimeout(marqueeLeftTimer);
    clearInterval(marqueeLeftIntervel);
  }

  move() {
    // 获取文字text 的计算后宽度  （由于overflow，直接获取不到）
    let width = document
      .getElementById('marquee-node')
      .getBoundingClientRect().width;
    let box = document.getElementById('marquee-box');
    let copy = document.getElementById('marquee-copy');
    copy.innerText = this.text;
    let distance = 0;
    //设置位移
    marqueeLeftIntervel = setInterval(function () {
      distance = distance - 1;
      if (-distance >= width) {
        distance = 16;
      }
      box.style.transform = 'translateX(' + distance + 'px)';
    }, 20);
  }

  render() {
    return (
      <div id='marquee-wrap'>
        <div className='marquee-icon'>
          <i className='iconfont-ui '>&#xe646;</i>
        </div>
        <div id='marquee-box'>
          <div
            id='marquee'
            dangerouslySetInnerHTML={{ __html: this.props.text }}
          ></div>
          <div id='marquee-copy'></div>
        </div>
        <div
          id='marquee-node'
          dangerouslySetInnerHTML={{ __html: this.props.text }}
        ></div>
      </div>
    );
  }
}

export default MarqueeLeft;
