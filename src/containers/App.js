import 'lib-flexible';

const App = (props) => {
  return (
    <div className='container-wrap-content'>
        {/* 全局APP */}
        {React.Children.map(props.children, (child) =>
          React.cloneElement(child, {})
        )}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    data: state,
  };
}

export default connect(mapStateToProps)(App);
