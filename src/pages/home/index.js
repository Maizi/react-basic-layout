import React from 'react';
import { connect } from 'react-redux';

const Home = () => {
  return <>Home</>
}

function mapStateToProps(state) {
  return {
    data: state,
  };
}

export default connect(mapStateToProps)(Home);
