const testFetch = (async ()=> {
    const test = await fetch("http://localhost:3000/api")
    const data = await test.json()
    console.log(data)
})

testFetch()

