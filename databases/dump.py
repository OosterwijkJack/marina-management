import sqlite3
import csv





def parseCSV():
    returnDictList = []
    with open("table.csv", mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter="\t")

        data = list(reader)
        for i in data:
            dataJson = {
                "first_name": i["first_name"],
                "last_name": i["last_name"],
                "address1": i["address"],
                "address2": i["address2"],
                "city": i["city"],
                "state": i["state"],
                "postal": i["mail_code"],
                "phone": i["phone"],
                "email": i["email"],
                "boat_name": "",
                "boat_size": "",
                "boat_type": ""
            }
            shouldContinue = False
            for a in returnDictList:
                if(a["first_name"] == i["first_name"] and a["last_name"] == i["last_name"]):
                    shouldContinue = True

            if shouldContinue: continue
            returnDictList.append(dataJson)
    return returnDictList

def main():
    data = parseCSV()

    connection = sqlite3.connect("MasterDatabase.db")
    cursor = connection.cursor()
    

    for i in data:
       cursor.execute("""
INSERT INTO campers (
    first_name, last_name, address1, address2, city, state,
    postal, phone, email, boat_name, boat_size, boat_type
) VALUES (
    :first_name, :last_name, :address1, :address2, :city, :state,
    :postal, :phone, :email, :boat_name, :boat_size, :boat_type
)
""", i)
    connection.commit()
    connection.close()



if __name__ == "__main__":
    main()