export const  getAllTasks = (request, response) => {
    response.status(200).send("Thanh Hàa");
}

export const  createAllTasks = (req, res) => {
    res.status(201).jsion({message: "Trương Nguyễn Thanh Hà"});
}

export const updateTask = (req, res) => {
    res.status(200).jsion({message: "Trương Nguyễn Mai Thanh"});
}

export const deleteTask = (req, res) => {
    res.status(200).jsion({message: "Trương Nguyễn NO Mai Thanh"});
}