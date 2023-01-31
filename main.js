import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { QElement, PriorityQueue, Stack } from './queue'

let RED = {color: 0xff0000}
let GREEN = {color: 0x00ff00}
let BLUE = {color: 0x0000ff}
let YELLOW = {color: 0xffff00}
let WHITE = {color: 0xffffff}
let BLACK = {color: 0x000000}
let PURPLE = {color: 0xcc8899}
let ORANGE = {color: 0xffa500}
let GREY = {color: 0x808080}
let TURQUOISE = {color: 0x40e0d0}

class Demo {
  constructor() {
    this.Init();
  }

  Init() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this.order = []
    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);
    this.iterator = 0;
    const fov = 60;
    this.frameNum = 0
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 50000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);




    this._camera.render
    this.isMaze = false
    this._scene = new THREE.Scene();
    this.gridHeight;
    this.gridWidth;
    this.start;
    this.end;
    this._scene.background = new THREE.Color(0xe2311d);

    this._light()
    document.getElementById("plot_Button").onclick = () => {
      if (!this.isMaze) {
        this.gridHeight = (parseInt(document.getElementById("gridHeight_Input").valueAsNumber))
        this.gridWidth = (parseInt(document.getElementById("gridWidth_Input").valueAsNumber))
        const startX = (parseInt(document.getElementById("startX_Input").valueAsNumber))
        const startY = (parseInt(document.getElementById("startY_Input").valueAsNumber))
        const endX = (parseInt(document.getElementById("endX_Input").valueAsNumber))
        const endY = (parseInt(document.getElementById("endY_Input").valueAsNumber))
  

    
        
        this.drawWall()
        this.makeGrid()
        this._camera.position.set(0, Math.max(this.gridHeight,this.gridWidth)+5, 0);
  
        this.start = this.grid[startX]
        this.start = this.start[startY]
        this.end = this.grid[endX]
  
        this.end = this.end[endY]
  
        this.end.makeEnd()
        this.end.draw()
        this.start.makeStart()
        this.start.draw()
      }else {
        const startX = (parseInt(document.getElementById("startX_Input").valueAsNumber))
        const startY = (parseInt(document.getElementById("startY_Input").valueAsNumber))
        const endX = (parseInt(document.getElementById("endX_Input").valueAsNumber))
        const endY = (parseInt(document.getElementById("endY_Input").valueAsNumber))
        this.start = this.grid[startX]
        this.start = this.start[startY]
        this.end = this.grid[endX]
  
        this.end = this.end[endY]
  
        this.end.makeEnd()
        this.end.draw()
        this.start.makeStart()
        this.start.draw()
      }


    }
    document.getElementById("clear_Button").onclick = () => {
      this.resetGrid()
    }
    document.getElementById("start_Button").onclick = () => {
      this.searchAlgo = (document.getElementById("cars").value)
      if (this.searchAlgo == "DFS") {
        this.dfs(this.grid, this.start, this.end)
      }else if (this.searchAlgo == "BFS") {
        this.bfs(this.grid, this.start, this.end)
      }else {
        
      }
      console.log(this.searchAlgo)

    }
    document.getElementById("maze_Button").onclick = () => {
      this.makeMaze(this.grid[0][0])
    }



    // this.drawWall()
    // this.makeGrid()
    // let wall = this.grid[0][1]

    // wall.makeWall()
    // wall.draw()

    // let start = this.grid[2][2]
    // start.getNeighborsMaze()
    // console.log()
    // start.makeStart()
    // start.draw()


    // let end = this.grid[19][19]

    // end.makeEnd()
    // end.draw()

    

    // this.dfs(this.grid, start, end)
    //this.makeMaze(start)
  

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.update();

    this._previousRAF = null;
    this._RAF();
  }

  makeUnvisited() {
    for (let x = 0; x<this.gridWidth; x++) {
      for (let y = 0; y<this.gridHeight; y++) {
        this.grid[x][y].mazeUnvisit()

      } 
    }
  }

  blackout() {
    for (let x = 0; x<this.gridWidth; x++) {
      for (let y = 0; y<this.gridHeight; y++) {
        this.grid[x][y].makeWall()
        this.grid[x][y].draw()
      } 
    }
  }

  makeMaze(vertex) {
    this.isMaze = true
    this.blackout()
    this.stack = []
    this.current = vertex
    let first = true;
    this.stack.push(this.current) 
    while (!this.stack.length == 0) {
      if (first) {
        this.stack.pop()
        first = false
      }
      this.current.visit()
      let next = this.current.getNeighborsMaze()
      let rand = Math.floor(Math.random()*this.current.neighbors.length)
      next = next[rand]
      if (next) {
        next.visit()
        this.stack.push(this.current) 
        this.current.mazeReset()
        this.current.wallbetween[rand].mazeReset()
        this.current = next
      } else if (!this.stack.length==0) {
        this.current.mazeReset()
        let c = this.stack.pop()
        this.current = c
        
      }

    }
    this.makeUnvisited()
  }


  resetGrid() {
    for (let x = 0; x<this.gridWidth; x++) {
      for (let y = 0; y<this.gridHeight; y++) {
        this.grid[x][y].reset()
        
      } 
    }
  }

  dfs(graph,vertex,end) {
    let f = 0
    let stack = new Stack()
    stack.add(vertex)
    while (!stack.isEmpty()) {
      let cur_node=stack.remove()
      this.order.push([])
      if (cur_node!=vertex) {
        this.order[f].push(cur_node)
      }
      if (!cur_node.isVisited()) {
        cur_node.visit()
        cur_node.getNeighbors()
        if (cur_node!=vertex) {
          cur_node.makePath()
        }
        for (let i = 0; i < cur_node.neighbors.length; i++) {
          const element = cur_node.neighbors[i];
          if (element == end) {
            return
          }

          stack.add(element)
        }
      }
      f++
    }

  }


  bfs(graph,vertex,end) {
   
    let queue = new PriorityQueue();
    let f = 0
    vertex.visit()
    vertex.makeStart()
    vertex.draw()
    queue.enqueue(vertex)
    while (!queue.isEmpty()) {
      let cur_node = queue.dequeue().element
      cur_node.getNeighbors()
      this.order.push([])
      for (let i = 0; i < cur_node.neighbors.length; i++) {
        const element = cur_node.neighbors[i];
        if (!element.isVisited()) {
          if (element == end) {
            return
          }
          element.visit()
          element.makeOpen()
          this.order[f].push(element)
          queue.enqueue(element)
          
        }
      }


      f++

    }
  }

  drawpoints() {
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
        if ((this.grid[i][j].isdrawn)&&(this.grid[i][j].Mesh.position.y < .5)) {
          this.grid[i][j].Mesh.position.y = (this.grid[i][j].Mesh.position.y + .01)
        }
      }     
    }
  }

  makeGrid() {
    const geometry = new THREE.PlaneGeometry( this.gridHeight+2, this.gridWidth+2 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.rotateX(-Math.PI / 2);
    plane.rotateZ(-Math.PI / 2);
    plane.name = "grid"
    this._scene.add( plane );

    const grid = new THREE.GridHelper(this.gridHeight,this.gridWidth)    
    grid.position.set(0,.01,0)
    this.grid = [];
    for (let x = 0; x<this.gridWidth; x++) {
      this.grid.push([])
      for (let y = 0; y<this.gridHeight; y++) {
        const point = new Point(y,x,this.gridHeight,this.gridWidth,this._scene,this.grid)
        
        this.grid[x].push(point)
      } 
    }
  }

  drawWall() {
    for (let x = -1; x<=this.gridWidth; x++){
      for (let y = -1; y<=this.gridHeight; y++) {
        if ((x == -1)||(y==-1)||(x == this.gridWidth)||(y == this.gridHeight)){
          const wallgeometry = new THREE.BoxGeometry( 1, 1, 1 );
          const wallmaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
          const wallMesh = new THREE.Mesh( wallgeometry, wallmaterial );
          wallMesh.position.set(x-(this.gridWidth/2)+.5, 0.5, -y+(this.gridHeight/2)-.5)
          this._scene.add(wallMesh)  
        }
      }
    }
  }

 _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _light() {
    this._scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1)
    this.dirLight.position.set(-50000, 50000, -10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.camera.top = 50000;
    this.dirLight.shadow.camera.bottom = -50000;
    this.dirLight.shadow.camera.left = -50000;
    this.dirLight.shadow.camera.right = 50000;
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 100000;
    this.dirLight.shadow.mapSize.width = 100000;
    this.dirLight.shadow.mapSize.height = 100000;
    this._scene.add(this.dirLight);
  }

  frameDraw() {
    if(this.order && (this.iterator<this.order.length)) {
      this.order
      THREE.CompressedPixelFormat;
      if (true) {
        let greenNum = 20
        if(this.iterator >greenNum) {
          for (let x = 0; x<this.order[this.iterator-greenNum].length;x++) {
            this.order[this.iterator-greenNum][x].makeClosed()
          }
        }

        for (let x = 0; x<this.order[this.iterator].length;x++) {
          
          this.order[this.iterator][x].draw()

        }
        this.iterator++
      }
      
    }else{

    }

    this.frameNum++
  }

  _RAF() {


    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }
      
      if(this.grid){
        this.frameDraw()
        this.drawpoints()

      }

      this._RAF();
      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this._mixers) {
      this._mixers.map(m => m.update(timeElapsedS));
    }
  }

}


class Point {
  constructor(row, col, totalRows, totalCol, scene, grid) {
    this.row = row
    this.col = col
    this.x = col
    this.y = row
    this.scene = scene
    this.color = WHITE
    this.neighbors = []
    this.totalRows = totalRows
    this.totalCols = totalCol
    const wallgeometry = new THREE.BoxGeometry( 1, 1, 1 );
    const wallmaterial = new THREE.MeshBasicMaterial( this.color );
    const wallMesh = new THREE.Mesh( wallgeometry, wallmaterial );
    this.Mesh = wallMesh
    this.isdrawn = false
    this.grid = grid
    this.visited = false
    this.wallbetween = []
    this.make()
  }

  getPosition(){
    return [this.x,this.y]
  }

  isVisited() {
    return this.visited == true
  }

  isClosed(){
    return this.color == RED
  }

  isOpen(){
    return this.color == GREEN
  }

  isWall(){
    return this.color == BLACK
  }

  isStart() {
    return this.color == ORANGE
  }

  isEnd() {
    return this.color == TURQUOISE
  }

  isDrawn() {
    return this.color == true
  }

  visit() {
    this.visited = true
  }

  resetColor() {
    this.color = WHITE
    this.Mesh.material.color.set('white')
    this.isdrawn = false
    this.Mesh.position.y = -.52
  }

  mazeReset() {
    this.color = WHITE
    this.Mesh.material.color.set('white')
    this.isdrawn = false
    this.Mesh.position.y = -.52
  }

  reset() {
    this.color = WHITE
    this.Mesh.material.color.set('white')
    this.isdrawn = false
    this.Mesh.position.y = -.52
    
    this.visited = false;
  }

  mazeUnvisit() {
    this.visited = false;
    this.neighbors = [];
    this.wallbetween = []
  }

  makeClosed(){
    this.color = RED
    this.Mesh.material.color.set('red')
  }

  makeOpen(){
    this.color = GREEN
    this.Mesh.material.color.set("green")
  }

  makeWall(){
    this.color = BLACK
    this.Mesh.material.color.set('black')
  }

  makeStart() {
    
    this.color = ORANGE
    this.Mesh.material.color.set('orange')
  }

  makeEnd() {
    this.color = TURQUOISE
    this.Mesh.material.color.set('turquoise')
  }

  makePath() {
    this.color = PURPLE
    this.Mesh.material.color.set('purple')
  }

  make() {
    this.Mesh.position.set(this.x-(this.totalCols/2)+.5, -0.52, -this.y+(this.totalRows/2)-.5)
    this.scene.add(this.Mesh)  
  }

  draw() {
    this.isdrawn = true
  }

  getNeighbors(grid) {
    if ((this.row < this.totalRows - 1) &&  (!this.grid[this.col][this.row + 1].isWall()))  { // DOWN
      this.neighbors.push(this.grid[this.col][this.row + 1])
    }

    if ((this.row > 0) &&  (!this.grid[this.col][this.row - 1].isWall())) { // UP
      this.neighbors.push(this.grid[this.col][this.row - 1])
    }

    if ((this.col < this.totalCols - 1) &&  (!this.grid[this.col + 1][this.row].isWall())) { // RIGHT
      this.neighbors.push(this.grid[this.col + 1][this.row])
    }

    if ((this.col > 0) && (!this.grid[this.col-1][this.row].isWall())) { // LEFT
      this.neighbors.push(this.grid[this.col - 1][this.row])
    }
    return this.neighbors
  }

  getNeighborsMaze(grid) {
    this.neighbors = []
    this.wallbetween = []
    if ((this.row < this.totalRows - 2) &&  (this.grid[this.col][this.row + 2].isWall()))  { // DOWN
      if (!(this.grid[this.col][this.row + 1].isVisited())) {
        this.neighbors.push(this.grid[this.col][this.row + 2])
        this.wallbetween.push(this.grid[this.col][this.row + 1])
      }
    }

    if ((this.row > 0) &&  (this.grid[this.col][this.row - 2].isWall())) { // UP
      if(!(this.grid[this.col][this.row - 1].isVisited())) {
        this.neighbors.push(this.grid[this.col][this.row - 2])
        this.wallbetween.push(this.grid[this.col][this.row - 1])
      }

    }

    if ((this.col < this.totalCols - 2) &&  (this.grid[this.col + 2][this.row].isWall())) { // RIGHT
      if (!(this.grid[this.col+1][this.row].isVisited())) {
        this.neighbors.push(this.grid[this.col + 2][this.row])
        this.wallbetween.push(this.grid[this.col + 1][this.row])
      }
    }

    if ((this.col > 0) && (this.grid[this.col-2][this.row].isWall())) { // LEFT
      if (!(this.grid[this.col-1][this.row].isVisited())) {
        this.neighbors.push(this.grid[this.col - 2][this.row])
        this.wallbetween.push(this.grid[this.col - 1][this.row])
      }

    }
    return this.neighbors
  }
}




let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Demo();
});