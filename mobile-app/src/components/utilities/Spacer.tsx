import React from 'react';
import {Box} from "native-base";

export interface Props {
  h?: number
}

const Spacer: React.FC<Props> = (props: Props) => {
  return (
      <Box h={props.h ?? 24} />
  );
};

export default Spacer;