import React, { Component } from 'react';

class DragAndDrop extends Component {
    constructor(props) {
        super(props);
        this.dragCounter = 0; // Initialize drag counter to track drag state
    }

    state = {
        drag: false
    }

    dropRef = React.createRef();

    // Handles drag events to prevent default browser behavior
    handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    // Handles dragenter event to detect when an item is dragged over the drop area
    handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({ drag: true });
        }
    }

    // Handles dragleave event to detect when the dragged item leaves the drop area
    handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.setState({ drag: false });
        }
    }

    // Handles drop event to process the dropped files
    handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ drag: false });

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Validate file types based on the acceptedFileType prop
            const validFiles = Array.from(files).filter(file => {
                // Check if file type matches the accepted type (video or image)
                if (this.props.acceptedFileType === 'video' && file.type.startsWith('video/')) {
                    return true;
                }
                if (this.props.acceptedFileType === 'image' && file.type.startsWith('image/')) {
                    return true;
                }
                return false; // Reject the file if type does not match
            });

            if (validFiles.length > 0) {
                this.props.handleDrop(validFiles); // Pass valid files to the parent
            } else {
                // Handle invalid file type case (e.g., show an error or alert)
                alert(`Only ${this.props.acceptedFileType} files are allowed.`);
            }

            // Clear data and reset drag counter
            e.dataTransfer.clearData();
            this.dragCounter = 0;
        }
    }

    // Lifecycle methods to add/remove event listeners for drag and drop events
    componentDidMount() {
        const div = this.dropRef.current;
        div.addEventListener('dragenter', this.handleDragIn);
        div.addEventListener('dragleave', this.handleDragOut);
        div.addEventListener('dragover', this.handleDrag);
        div.addEventListener('drop', this.handleDrop);
    }

    componentWillUnmount() {
        const div = this.dropRef.current;
        div.removeEventListener('dragenter', this.handleDragIn);
        div.removeEventListener('dragleave', this.handleDragOut);
        div.removeEventListener('dragover', this.handleDrag);
        div.removeEventListener('drop', this.handleDrop);
    }

    render() {
        return (
            <div className={this.props.dragdrop} ref={this.dropRef}>
                {this.props.children}
            </div>
        );
    }
}

export default DragAndDrop;
