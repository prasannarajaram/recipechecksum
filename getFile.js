var initialValues = new Array();

$(function () {
    $("#input").on("change", function () {
        var excelFile,
        fileReader = new FileReader();
        $("#result").hide();

        fileReader.onload = function (e) {
            var buffer = new Uint8Array(fileReader.result);
            
            $.ig.excel.Workbook.load(buffer, function (workbook) {
                var column, row, newRow, cellValue, columnIndex, i,
                worksheet = workbook.worksheets(0),
                columnsNumber = 0,
                gridColumns = [],
                data = [], 
                worksheetRowsCount;
              // Both the columns and rows in the worksheet are lazily created and because of this most of the time worksheet.columns().count() will return 0
              // So to get the number of columns we read the values in the first row and count. When value is null we stop counting columns:
              while (worksheet.rows(0).getCellValue(columnsNumber)) {
                  columnsNumber++;
              }
              // Iterating through cells in first row and use the cell text as key and header text for the grid columns
              for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                  column = worksheet.rows(0).getCellText(columnIndex);
                  gridColumns.push({ headerText: column, key: column });
              }
              // We start iterating from 1, because we already read the first row to build the gridColumns array above
              // We use each cell value and add it to json array, which will be used as dataSource for the grid
              for (i = 1, worksheetRowsCount = worksheet.rows().count(); i < worksheetRowsCount; i++) {
                  newRow = {};
                  row = worksheet.rows(i);
                  for (columnIndex = 0; columnIndex < columnsNumber; columnIndex++) {
                      cellValue = row.getCellText(columnIndex);
		            if (columnIndex == 2) {
                        initialValues.push(cellValue)
                    }
                      newRow[gridColumns[columnIndex].key] = cellValue;
                  }
                  data.push(newRow);
              }
              // we can also skip passing the gridColumns use autoGenerateColumns = true, or modify the gridColumns array
              createGrid(data, gridColumns);
              genCheckSum();  
          }, function (error) {
              $("#result").text("The excel file is corrupted.");
              $("#result").show(1000);
          });
      }
      if (this.files.length > 0) {
          excelFile = this.files[0];
          if (excelFile.type === "application/vnd.ms-excel" || excelFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || (excelFile.type === "" && (excelFile.name.endsWith("xls") || excelFile.name.endsWith("xlsx")))) {
              fileReader.readAsArrayBuffer(excelFile);
          } else {
              $("#result").text("The format of the file you have selected is not supported. Please select a valid Excel file ('.xls, *.xlsx').");
              $("#result").show(1000);
          }
      }
  })
});

function createGrid(data, gridColumns) {
    if ($("#grid1").data("igGrid") !== undefined) {
        $("#grid1").igGrid("destroy");
    }

    $("#grid1").igGrid({
        columns: gridColumns,
        autoGenerateColumns: true,
        dataSource: data,
        width: "100%",

    });
}

// (* If this is the case, then do the following for each individual recipe parameter: *)
// (* Step 1: Convert recipe parameter into dword *)
// (* Step 2: Perform bit-XOR between CalcChkSum and next dword recipe parameter *)
// (* Step 3: Check sign of CalcChkSum *)
// (* Step 4: Right-rotate CalcChkSum by one position *)
// (* Step 5: Re-assign sign to CalcChkSum *)

//    (* SisRcpGmid *)
   
//    CalcChkSum := CalcChkSum XOR dint_to_dword( RcpDataIn.SisRcpGmid );
//    if dword_to_dint( CalcChkSum ) < 0 then
//       CalcChkSum := dint_to_dword(0 - dword_to_dint( ror( in := CalcChkSum, n := 1 )));
//    else
//       CalcChkSum := ror( in := CalcChkSum, n := 1 );
//    end_if;
// genCheckSum();


function decToHex(value) {
    // (* Step 1: Convert recipe parameter into dword *)
    var hexArray = new Array();
    for (i=0; i<= initialValues.length - 2; i++) {
        hexArray.push(Number(value[i]).toString(16));
    }
    return hexArray;
}

function bitXor_rotate(value) {
    // (* Step 2: Perform bit-XOR between CalcChkSum and next dword recipe parameter *)
    let calcChkSum = 0;
    for (i=0; i <= value.length; i++) {
        calcChkSum = calcChkSum ^ value[i];
        calcChkSum = calcChkSum.toString(16);
        if (calcChkSum < 0) {
            console.log("Negative");
        }
        else {
            console.log("Positive");
        }
        
    }
}

function genCheckSum() {
    let hexValues = decToHex(initialValues);
    let xorValues = bitXor_rotate(hexValues);
}

function rotateRight(n, d) {
    const INT_BITS = 32
    console.log(9 << 1);
    console.log(9 >> 3);
    return (n >> d)|(n << (INT_BITS - d));
}

// console.log(rotateRight(9,1));