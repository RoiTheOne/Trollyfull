
import React from 'react'
import { useDrag } from 'react-dnd'
import { utils } from '../../services/utils'
import { ItemTypes } from '../../services/dndItems.js'

export function ActivitiePreview({ act, onRemoveAct, onEdit, destinations, onOpenDetails }) {

    const [{ isDragging }, drag] = useDrag({
        item: {
            type: ItemTypes.ACTIVITIE,
            id: act.id
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging()
        })
    })

    

    
    const isFirstCol = (act.col === 0) ? 'first-col' : ''
    const isDayHeadClass = (act.literalDay) ? 'literal-day' : ''
    const isDrag = (isDragging) ? 'is-drag' : ''
    const isLenOne = (act.duration === 1) ? 'len-one' : ''
    const dest= destinations.findIndex(dest => act.destination === dest.name)

    return (
        <div ref={drag} className={`activity-prev-assembly activity-assembly ${isLenOne} ${isDayHeadClass} ${isFirstCol} ${isDrag}`} style={{ gridRow: `${act.row + 1 || 'auto'}/span ${act.duration}` }} key={utils.makeId()}>
            <div className={'dest-color dest-'+dest}></div>
            <div className="activity-name-container">
            <h5>{act.name}</h5>
            </div>
            <div className="activity-assembly-details column">
              
                <div className="activity-assembly-controls flex">
                    <button onClick={() => { onOpenDetails(act) }}><i className="fas fa-info"></i></button>
                    <button onClick={() => { onRemoveAct(act.id) }} className="delete-activity "><i className="fas fa-trash"></i></button>
                </div>
            </div>
        </div >
    )
}
