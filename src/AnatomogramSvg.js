import React from 'react'
import PropTypes from 'prop-types'
import ReactSVG from 'react-svg'

import './AnatomogramSvg.css'

import {groupBy} from 'lodash'

const groupIntoPairs = (arr,f) => Object.entries(groupBy(arr,f))

const getSvgElementById = (svgDomNode) => {
  const getEfoLayerGroup = (svgDomNode) => {
    const svgGroups = svgDomNode.getElementsByTagName(`g`)
    for (let i = 0 ; i < svgGroups.length ; i++) {
      if (svgGroups[i].id === `LAYER_EFO`) {
        return svgGroups[i]
      }
    }
  }

  const efoLayerGroup = getEfoLayerGroup(svgDomNode)

  function _getSvgElementById(id) {
    if (efoLayerGroup) {
      for (let i = 0 ; i < efoLayerGroup.children.length ; i++) {
        if (efoLayerGroup.children[i].id === id ) {
          if (efoLayerGroup.children[i].attributes[`xlink:href`]) {
            return _getSvgElementById(efoLayerGroup.children[i].attributes[`xlink:href`].value.substring(1))
          }
          else {
            return efoLayerGroup.children[i]
          }
        }
      }
    }
  }

  return _getSvgElementById
}

const paintSvgElement = (element, elementMarkup) => element && elementMarkup && Object.assign(element.style, elementMarkup)

const registerEvent = (element, eventType, elementMarkup, callback) => {
    element && element.addEventListener(eventType, () => {
        paintSvgElement(element, elementMarkup)
        callback()
    })
}


const initialiseSvgElements = (getSvgElementById, {idsWithMarkup, onMouseOver,onMouseOut,onClick}) => {
  //More than one id can correspond to an element - see the svg "use" elements
  groupIntoPairs(
      idsWithMarkup
        .map(e=>e.id)
        .filter((e,ix,self)=> self.indexOf(e)==ix)
        .map(id => [getSvgElementById(id),id]),
      '[0].id'
  )
  .forEach(a => {
      const element = a[1][0][0]
      const ids = a[1].map(t => t[1])
      //Given an element and its ids, we take the first element of the idsWithMarkup array that is one of the ids
      const markupNormalAndUnderFocus = idsWithMarkup.find(m => ids.includes(m.id))

      paintSvgElement(element, markupNormalAndUnderFocus.markupNormal)

      registerEvent(element, "mouseover", markupNormalAndUnderFocus.markupUnderFocus, onMouseOver.bind(this, ids))
      registerEvent(element, "mouseout", markupNormalAndUnderFocus.markupNormal, onMouseOut.bind(this, ids))
      registerEvent(element, "click", {}, onClick.bind(this, ids))
  })
}

const loadSvg = (species, selectedView) => require(`./svg/${species}${selectedView ? `.${selectedView}` : ``}.svg`)

// ReactSVG loads the SVG file asynchronously (hence the callback prop). We don’t use componentDidUpdate or
// componentDidMount because they can’t guarantee that the SVG is already loaded when they’re run. If
const AnatomogramSvg = (props) =>
  <div className={`gxa-anatomogram-svg-wrapper`}>
    <ReactSVG
      path={loadSvg(props.species, props.selectedView)}
      callback={svgDomNode => { initialiseSvgElements(getSvgElementById(svgDomNode), props) }}
      className={`gxa-anatomogram-svg`}
      style={{paddingLeft: props.selectedView ? `10px` : ``}} />
  </div>

AnatomogramSvg.propTypes = {
  species: PropTypes.string.isRequired,
  selectedView: PropTypes.string,

  showIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  highlightIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectIds: PropTypes.arrayOf(PropTypes.string).isRequired,

  showColour: PropTypes.string.isRequired,
  highlightColour: PropTypes.string.isRequired,
  selectColour: PropTypes.string.isRequired,

  showOpacity: PropTypes.number.isRequired,
  highlightOpacity: PropTypes.number.isRequired,
  selectOpacity: PropTypes.number.isRequired,

  onMouseOver: PropTypes.func.isRequired,
  onMouseOut: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
}

export default AnatomogramSvg
