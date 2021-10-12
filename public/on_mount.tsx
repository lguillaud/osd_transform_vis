import React, { Ref } from 'react';

interface OnMountComponentProps {
  onMount: () => {};
  onUpdate: () => {};
  dangerouslySetInnerHTML: {
    __html: string;
  };
  forwardedRef: Ref<HTMLDivElement>;
}

class OnMount extends React.Component<OnMountComponentProps> {
  componentDidMount() {
    this.props.onMount();
  }
  componentDidUpdate() {
    this.props.onUpdate();
  }
  render() {
    return (
      // eslint-disable-next-line react/no-danger,prettier/prettier
      <div ref={this.props.forwardedRef} dangerouslySetInnerHTML={this.props.dangerouslySetInnerHTML} />
    );
  }
}

// eslint-disable-next-line import/no-default-export
export default React.forwardRef<HTMLDivElement, Omit<OnMountComponentProps, 'forwardedRef'>>(
  (props, ref) => {
    return <OnMount {...props} forwardedRef={ref} />;
  }
);
