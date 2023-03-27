import * as React from 'react'
import { ReactNode, useEffect, useState } from 'react'
import { animated, useChain, useSpring, useSpringRef } from 'react-spring'
import { Box, BoxProps } from '@mui/material'
import { useMeasure } from 'react-use'

export interface ShowHideComponentsProps extends BoxProps {
  show: boolean
  children: ReactNode
  immediate?: boolean
}

const ShowHideComponents: React.FC<ShowHideComponentsProps> = (props) => {
  const { show, children, immediate, ...boxProps } = props

  // This is needed if children contain a ShowHideContainer or a
  // component that grows or is inserted after the spring has finished.
  const [fromHeight, setFromHeight] = useState(0)

  useEffect(() => {
    // Update the previous Height to zero if it is not showing
    // so the rever action can proper hide the children.
    if (!show) {
      setFromHeight(0)
    }
  }, [show])

  // Stretch Spring
  const [containerRef, { height }] = useMeasure()
  const stretchRef = useSpringRef()
  const [stretchStyles] = useSpring(
    {
      to: { height },
      from: { height: fromHeight },
      reset: show,
      reverse: !show,
      immediate,
      config: { duration: 200 },
      ref: stretchRef,
      onRest: () => {
        // After finish the showing the children update
        // the fromHeight with current height so if the
        // children change it's height while is showing
        // the spring starts from current height and not
        // from zero.
        setFromHeight(height)
      }
    },
    [show, height]
  )

  // Fade in Spring
  const fadeInRef = useSpringRef()
  const [fadeInStyles] = useSpring(
    {
      to: { opacity: 1 },
      from: { opacity: 0 },
      config: { duration: 400 },
      reset: show,
      ref: fadeInRef,
      width: '100%'
    },
    [show]
  )

  useChain(show ? [stretchRef, fadeInRef] : [fadeInRef, stretchRef])

  return (
    <animated.div
      style={{ overflow: 'hidden', width: '100%', ...stretchStyles }}
    >
      <animated.div style={fadeInStyles}>
        <Box
          ref={containerRef}
          boxSizing={'border-box'}
          display={'inline-block'}
          {...boxProps}
        >
          {show && children}
        </Box>
      </animated.div>
    </animated.div>
  )
}

export default ShowHideComponents
