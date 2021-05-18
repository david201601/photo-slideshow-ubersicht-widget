// This is a simple example Widget to get you started with Übersicht.
// For the full documentation please visit:
// https://github.com/felixhageloh/uebersicht
import { run } from 'uebersicht'

// ***************** OPTION ******************
export const absolutPath = "''" // e.g. "'/Users/MyProfile/Photos'"
export const fromTopPercentage = 50
export const fromLeftPercentage = 1
export const durationMs = 10 * 1000 // duration with miliseconds
export const width = 350
export const height = 200
export const corners = 15
export const border = 0
export const shadow = .2
// ***************** OPTION ******************

// the refresh frequency in milliseconds
export const refreshFrequency = durationMs;

// the CSS style for this widget, written using Emotion
// https://emotion.sh/
export const className =`
  top: ${fromTopPercentage}%;
  left: ${fromLeftPercentage}%;
  width: ${width}px;
  height: ${height}px;
  background-color: rgba(0, 0, 0, 0.4);
  color: #141f33;
  font-family: Helvetica Neue;
  font-weight: 300;
  text-align: justify;
  line-height: 1.5;
  border-radius: ${corners}px;

  h1 {
    font-size: 20px;
    margin: 16px 0 8px;
  }

  em {
    font-weight: 400;
    font-style: normal;
  }

  .image-frame {
    width: ${width}px;
    height: ${height}px;
    border-radius: ${corners}px;
    border: ${border}px solid #000;
    background-color: rgba(0, 0, 0, 0.4);
    box-shadow: 0px 0px 8px 8px rgba(0, 0, 0, ${shadow});
    object-fit: cover;
  }
`

export const initialState = {
  loading: true,
  imageList: null,
  imageData: null,
  initIndex: 0,
  nextIndex:0
}

export const updateState = (event, previousState) => {
  if (event.error) {
    return { ...previousState, warning: `We got an error: ${event.error}` }
  }

  switch (event.type) {
    case 'GET_IMAGE_LIST':
      const { imageList } = event
      return { ...previousState, imageList, index: event.index, type: event.type }
    case 'OBTAIN_IMAGE':
        const { imageData } = event
        return { ...previousState, imageData, index: event.index, type: event.type }
    default:
      return previousState
  }
}

// this is the shell command that gets executed every time this widget refreshes
export const command = (dispatch) => {
  run("cd " + absolutPath + " && ls").then((result) => {
  dispatch({ type: 'GET_IMAGE_LIST', imageList: result.trim().split("\n"), index: 0 })
})
}


export const getImage = (imageList, index, dispatch) => {
   return run("base64 " + absolutPath + "/" + imageList[index]).then((result) => {
      const imageBase64 = ("data:image/$type;base64," + result)
      dispatch({ 
        type: 'OBTAIN_IMAGE', imageData: imageBase64,
    })
    }).catch((err) => console.log(err))
}

export const delay = (n) => new Promise(resolve => setTimeout(resolve, n));

export const randomExclude = (n, exclude) => {
  var rand = null
  if(exclude == null || exclude == undefined) {
    return Math.floor((Math.random() * n) + 0)
  }
  while(rand === null || rand === exclude){
    rand = Math.floor((Math.random() * n) + 0);
 }
  return rand
}

// render gets called after the shell command has executed. The command's output
// is passed in as a string.
export const render = ({imageList, imageData, type}, dispatch) => {
  {
    if (imageList != undefined && type == 'GET_IMAGE_LIST') {
      run('cat temp-photo-frame.txt').then((res)=> {
        const index = randomExclude(imageList.length, parseInt(res.trim()))
        const com = "echo '" + index + "' | cat > temp-photo-frame.txt"
        run(com).then(()=> {
          getImage(imageList, index, dispatch)
        })
      })
      .catch((err) =>
      {
        const index = randomExclude(imageList.length)
        const com = "echo '"+index+"' | cat > temp-photo-frame.txt"
        run(com).then(()=> {
          getImage(imageList, index, dispatch)
        })
      })
  }
  }
  return(
    <div>
      <img class="image-frame" src={imageData}></img>
    </div>
  );
}

