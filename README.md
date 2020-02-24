## Liven js
A scalable Frontend Javascript framework for high performance and flexibility for building solid Single Page Apps

### Use Cases
1. You can use this framework to build small single page apps
2. You can use this framework to build scalable and large single page apps
3- less dependencies more productivity
5- kick starting app

### Features
1. Component based
2. zero time to start your development process
3. Scalable Framework which allows you to build any type of single page apps
4. Uses Javascript Es6 code syntax and class concept
   Uses Javascript Proxy for real time dom updates
5. Solid Routing System
6. Dom Updating without emitting any functions to change the DOM
7. Isolated components and Data Model for every component
8. Writing isolated HTML component and JS component or writing them together in the same file
9. Shadow DOM based

**content**
  - [Installing](#installing)
  - [Setup]($setup)
  - [Getting Started](#getting-started)
  - [Component]($component)
    - [Extend Component](#extend-component)
    - [Component HTML](#component-html)
    - [render HTML Component](#render-html-component)
    - [Component Controller](#component-controller)
    - [Component Props](#component-props)
    - [Component Data](#component-data)
    - [Component Life cycle](#component-life-cycle)
    - [Component Methods](#component-methods)
    - [Data Binding](#component-data-binding)
        - [Passing Data to html](passing-data-to-html)
        - [Accessing data inside html](#accessing-data-inside-html)
    - [Data Changing](#data-changing)
    - [loop In Data](#loop-in-data)
    - [Component Event Emitter](#component-event-emitter)
    - [Child Components](#child-components)
    - [looped Components](#looped-components)

## Getting Started
#### Example
```javascript
import {Liven, Component} from "liven"

class HomeComponent extends Component{

    constructor(props) {
        super(props);

        // define data
        
        this.$store.message = "hello";
        
        this.$store.frameWork = "liven"
        
        // init the component on instantiate
        this.init();
    }
    render() {
    
    return `<div class="component">
            <h1>{{message}} {{frameWork}}</h1>
        </div>`
    
    }
}
// instantiate the home component class
const home = new HomeComponent({

    // define the parent element

    parent: ".app",
    uniqueName: "homeComponent"
})
```
#### Content
- [installing](#installing)

#### installing
```
npm install liven
```

#### Components
Liven js is build upon component concept, it divides the web page into components and every component can contain many and many small components inside it and every component is isolated with specific data model which is active along the time and reflects dom changes once you change the data of that component

Liven js uses Javascript Es6 classes to extend Liven js component class to your own custom components
Liven js uses native html elements without shadow root or web components to give you best performance and SEO optimization

**Example**
```javascript
import {Liven, Component} from "liven"

class HomeComponent extends Component{

    constructor(props) {
        super(props);

        // define data
        
        this.$store.message = "hello";
        
        this.$store.frameWork = "Livenjs"
        
        // init the component on instantiate
        this.init();
    }
    render() {
    
    return `<div class="component">
            <h1>{{message}} {{frameWork}}</h1>
        </div>`
    
    }
```

to create your first Livenjs Component you need to import Liven and Component classes from liven as the following:

```javascript
import {Liven, Component} from "liven"
```
Now to write your own component you need to extend a class from Component class like the following

```javascript
class Header extends Component{
    // call constructor
    constructor(props) {
        super(props);
    }
}
```

Every component should have some props as setting object for this component and you should pass these props to the super class as the above example

Maybe type are asking now how will you write html content inside Js file !!!

You have two options to write component html content as the following

- write html elements as string inside render function in component class
- write html content in separated html file

##### Write HTML content inside Livenjs Component file
```javascript
class Header extends Component{
    // call constructor
    constructor(props) {
        super(props);
    }
    // render method to render html content
    render() {
        return `
            <header>
                <nav>
                    <h1>Header Component</h1>
                </nav>
            </header>
        `
    }
}
```
Until now Livenjs component will not be working because you need two things:
1. create a parent element in html page to put this component inside it
2. instantiate this component and init it


Now create html file called ``index.html``

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Livenjs Example</title>
</head>

<body>
    <!-- header component -->
    <div class="header"></div>
    <h1>page</h1>
    <script type="module" src="/app.js"></script>
</body>
</html>
```
Now you need to instance ``Header`` component that you have created and initialize it
```javascript
const header = new Heder({
    parent: document.querySelector(".header")
});
```
When you instantiate a new component there are some configuration and settings you can set to that component, some of these settings are mandatory and others are optional

#### component ``props`` object
|key |description |value |required |type |
|-|-|-|-|-|
|parent|the html parent that you want to assign this component to it|document.querySelector or string|true|dom element or string |
|uniqueName|a unique name or id you assign to this component |componentName|true|string |
|animate |animation you want to add to the component when it initialized |Object |false | Object|
|fadeIn |fadeIn animation you want to add to the component when it initialized |Object |false | Object|
|slideDown |slideDown animation you want to add to the component when it initialized |Object |false | Object|

**initialize Livenjs Component**
```javascript
header.init();
```
This function makes initialization to the component, also you can make the component auto initialized when you instance a new component like the following
```javascript
class Header extends Component{
    // call constructor
    constructor(props) {
        super(props);
        // initialize the component
        this.init();
    }
    // render method to render html content
    render() {
        return `
            <header>
                <nav>
                    <h1>Header Component</h1>
                </nav>
            </header>
        `
    }
}
const header = new Heder({
    parent: document.querySelector(".header")
});
```

#### Livenjs Component life cycle
Liven Component passes with some cycles starts from init event and ends with out method
1. ``component.init() method``

THis method is mandatory to use to initialize the component like the example above

2. ``component.onInit()``

This method you use inside the component class to make some events or any logic you want to apply when the component is initialized

**Example**

```javascript
class App extends Component{
    constructor(props) {
        super(props);
    }
    onInit() {
        alert();
    }
}
```
3. ``component.load()``

This method is used to apply something when the component finishes loading, and the meaning of loading here if you are calling external API or use ajax to do something
```javascript
class App extends Component{
    constructor(props) {
        super(props);
    }
    onInit() {
        alert();
    }
    load() {
        console.log("component now is fully loaded");
    }
}
```
