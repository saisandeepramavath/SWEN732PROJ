import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Index from '@/app/index'

it('App should render correctly', () => {
  const tree = renderer.create(<Index />).toJSON()
  expect(tree).toMatchSnapshot()
})