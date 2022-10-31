//  Define states
let IDLE = 0
let COOKING = 1
let PAUSED = 2
let DONE = 3
//  Set initial variable values
let start_time_ms = control.millis()
let button_A_was_pressed = false
let button_B_was_pressed = false
let currentState = IDLE
let currentTime = 0.0
//  These functions take care of button presses throughout the program. This function makes it so that
//  you register a full press and release of the button before anything happens. If you are using two buttons,
//  you should do something similar.
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    
    button_A_was_pressed = true
    
})
input.onButtonPressed(Button.B, function on_button_pressed_b() {
    
    button_B_was_pressed = true
    
})
//  This function is used to indicate that the timer has run down to zero.
function playSound() {
    music.playTone(Note.C, music.beat())
    basic.pause(500)
    music.playTone(Note.C, music.beat())
    basic.pause(500)
    music.playTone(Note.C, music.beat())
}

function updateSystem() {
    let current_time_ms: number;
    //  Any Python function needs the global keyword next to any global variable names
    //  you plan to use.
    
    
    
    
    // Slide 3 describes the logic below
    if (currentState == IDLE) {
        //  This updates with the current time for cooking. This is needed to 
        start_time_ms = control.millis()
        //  If button B is pressed during IDLE, it adds 5 seconds to the currentTime which tracks cooking time.
        if (button_B_was_pressed) {
            currentTime += 5
        }
        
    }
    
    if (currentState == COOKING) {
        //  We only need to change the currentTime of the microwave during the cooking state.
        current_time_ms = control.millis()
        if (current_time_ms - start_time_ms > 1000) {
            currentTime -= 1
            start_time_ms = current_time_ms
        }
        
        if (button_B_was_pressed) {
            currentTime += 5
            button_B_was_pressed = false
        }
        
    }
    
    if (currentState == PAUSED) {
        if (button_A_was_pressed) {
            currentTime = 0
        }
        
    }
    
}

function evaluateState(state: number): number {
    //  Changes of state depend only on these three global variables.
    
    
    
    //  This is the logic presented on slide 4
    if (state == IDLE) {
        if (button_B_was_pressed) {
            //  You will see me use this structure throughout the program - why not use input.button_is_pressed(Button.A)?
            //  This is because we want to track a full button press and release before changing state. By using a variable
            //  to store a Boolean value indicating that a full button press has occurred, it only registers a change
            //  once per press. Otherwise, holding down the button would cause this logic to run continuously.
            //  We also set this equal to false after we use it so that we are ready to notice the next press.
            button_B_was_pressed = false
            return COOKING
        }
        
    } else if (state == COOKING) {
        //  This is the logic presented on slide 5
        if (button_A_was_pressed) {
            button_A_was_pressed = false
            return PAUSED
        }
        
        if (currentTime <= 0) {
            return DONE
        }
        
    } else if (state == PAUSED) {
        //  This is the logic presented on slide 6
        if (button_B_was_pressed) {
            button_B_was_pressed = false
            return COOKING
        } else if (button_A_was_pressed) {
            button_A_was_pressed = false
            return IDLE
        }
        
    } else if (state == DONE) {
        //  This is the logic presented on slide 7
        return IDLE
    }
    
    //  If the logic somehow fails, or no changes to state are needed based on the variables, we leave the state unchanged.
    return state
}

function reactToState(state: number) {
    
    //  For the purpose of demonstrating that this works, I've used print statements for everything here except DONE.
    //  
    if (state == COOKING) {
        //  The convert_to_text function is how you turn a number into a string using the serial port.
        serial.writeLine("time left:" + convertToText(currentTime))
    } else if (state == PAUSED) {
        serial.writeLine("paused")
    } else if (state == DONE) {
        serial.writeLine("food is ready!")
        playSound()
    } else if (state == IDLE) {
        serial.writeLine("waiting")
    }
    
}

//  This next line seems so basic, but it is what tells the micro:bit to run the entire program. 
basic.forever(function on_forever() {
    
    //  Here are the standard functions for a state machine program.
    updateSystem()
    currentState = evaluateState(currentState)
    reactToState(currentState)
    
})
