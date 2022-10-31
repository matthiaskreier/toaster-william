# Define states
IDLE = 0
COOKING = 1
PAUSED = 2
DONE = 3

# Set initial variable values
start_time_ms = control.millis()
button_A_was_pressed = False
button_B_was_pressed = False
currentState = IDLE
currentTime = 0.0

# These functions take care of button presses throughout the program. This function makes it so that
# you register a full press and release of the button before anything happens. If you are using two buttons,
# you should do something similar.

def on_button_pressed_a():
    global button_A_was_pressed
    button_A_was_pressed = True
    pass

def on_button_pressed_b():
    global button_B_was_pressed
    button_B_was_pressed = True
    pass

input.on_button_pressed(Button.A, on_button_pressed_a)
input.on_button_pressed(Button.B, on_button_pressed_b)

# This function is used to indicate that the timer has run down to zero.
def playSound():
    music.play_tone(Note.C, music.beat())
    basic.pause(500)
    music.play_tone(Note.C, music.beat())
    basic.pause(500)
    music.play_tone(Note.C, music.beat())

def updateSystem():
    # Any Python function needs the global keyword next to any global variable names
    # you plan to use.
    global start_time_ms
    global currentTime
    global button_A_was_pressed
    global button_B_was_pressed

    #Slide 3 describes the logic below
    if(currentState == IDLE):  
        # This updates with the current time for cooking. This is needed to 
        start_time_ms = control.millis()
        # If button B is pressed during IDLE, it adds 5 seconds to the currentTime which tracks cooking time.
        if(button_B_was_pressed):
            currentTime += 5
            
    if(currentState == COOKING):
        # We only need to change the currentTime of the microwave during the cooking state.
        current_time_ms = control.millis()
        if(current_time_ms - start_time_ms) > 1000:
            currentTime -= 1
            start_time_ms = current_time_ms
        if(button_B_was_pressed):
            currentTime += 5
            button_B_was_pressed = False

    if(currentState == PAUSED):
        if(button_A_was_pressed):
            currentTime = 0
            
            
def evaluateState(state):
    # Changes of state depend only on these three global variables.
    global button_A_was_pressed
    global button_B_was_pressed
    global currentTime

    # This is the logic presented on slide 4
    if(state==IDLE):
        if(button_B_was_pressed):

            # You will see me use this structure throughout the program - why not use input.button_is_pressed(Button.A)?
            # This is because we want to track a full button press and release before changing state. By using a variable
            # to store a Boolean value indicating that a full button press has occurred, it only registers a change
            # once per press. Otherwise, holding down the button would cause this logic to run continuously.
            # We also set this equal to false after we use it so that we are ready to notice the next press.
            button_B_was_pressed = False
            return COOKING
    
    # This is the logic presented on slide 5
    elif(state == COOKING):
        if(button_A_was_pressed):
            button_A_was_pressed = False
            return PAUSED
        if(currentTime <= 0):
                    return DONE

    # This is the logic presented on slide 6
    elif(state == PAUSED):
        if (button_B_was_pressed):
            button_B_was_pressed = False
            return COOKING
        elif(button_A_was_pressed):
            button_A_was_pressed = False
            return IDLE

    # This is the logic presented on slide 7
    elif(state==DONE):
        return IDLE
    
    # If the logic somehow fails, or no changes to state are needed based on the variables, we leave the state unchanged.
    return state

def reactToState(state):
    global currentTime
    
    # For the purpose of demonstrating that this works, I've used print statements for everything here except DONE.
    # 
    if(state == COOKING):
        # The convert_to_text function is how you turn a number into a string using the serial port.
        serial.write_line("time left:" + convert_to_text(currentTime))
    elif(state == PAUSED):
        serial.write_line("paused")
    elif(state == DONE):
        serial.write_line("food is ready!")
        playSound()
    elif(state == IDLE):
        serial.write_line("waiting")

def on_forever():
    global currentState
    
    # Here are the standard functions for a state machine program.
    updateSystem()
    currentState = evaluateState(currentState)
    reactToState(currentState) 
    pass

# This next line seems so basic, but it is what tells the micro:bit to run the entire program. 
basic.forever(on_forever)