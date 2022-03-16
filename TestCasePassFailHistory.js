function TestCasePassFailHistory() {
    function shortUrl(type) {
        if (type == "User Story") {
            return "ar";
        }
        if (type == "Defect") {
            return "df";
        }
        else if (type == "Test Case") {
            return "tc";
        }
        else if (type == "Test Case Result") {
            return "tcr";
        }
    
        return "error";
    }
    
    var TC_TABLE_START = "<table><tr><td>";
    var ROW_END = "     </td>\n  </tr>\n";
    var EMPTY_CELL = "     <td>&nbsp;</td>\n";
    var EMPTY_ROW = "  <tr>\n" + EMPTY_CELL + "</tr>\n";
    var TABLE_END = "</table>";
    var TC_LINK = "<div class=\"heading\"><a href=\"_TARGET_URL_\" target=\"_top\">_ID_ _NAME_</a>_WP_LINK_</div>";
    var WP_LINK = "(<a href=\"_WP_TARGET_\" target=\"_top\">_WP_TEXT_</a>)";
    var TCR_TABLE_START = "    <table width=\"180px\">\n";
    var TCR_HEADER_ROW = "<tr> <th>ID</th>" +
            "<th>&nbsp;</th>" +
            "<th>Build</th>" +
            "<th>&nbsp;</th>" +
            "<th>Date and Time</th>" +
            "<th>&nbsp;</th>" +
            "<th>Verdict</th>" +
            "<th>&nbsp;</th>" +
            "<th>Tester</th>" +
            "</tr>";
    var EMPTY_TCR_TABLE = TCR_TABLE_START + "  <tr>\n    <th align=\"left\">None</th>\n  </tr>\n</table>\n";
    var TCR_TABLE = TCR_TABLE_START + "  " + TCR_HEADER_ROW + "\n";
    var TCR_ROW = "  <tr>\n" +
            "     <td valign=\"middle\"><a href=\"_TCR_LINK_\" target=\"_top\">_TCR_IDENT_</a></td>\n" +
            EMPTY_CELL +
            "     <td valign=\"middle\" align=\"center\">_BUILD_</td>\n" +
            EMPTY_CELL +
            "     <td valign=\"middle\" align=\"center\">_DATE_</td>\n" +
            EMPTY_CELL +
            "     <td valign=\"middle\" align=\"center\">_VERDICT_BOX_</td>\n" +
            EMPTY_CELL +
            "     <td valign=\"middle\" align=\"center\">_TESTER_</td>\n" +
            "  </tr>\n";
    
    // Here's what a Test Case Result table looks like:
    //<table width="180px">
    //   <HEADER_ROW>
    //   <tr>
    //      <td valign="middle"><a href=\"_TCR_LINK_\" target=\"_top\">_TCR_IDENT_</a></td>
    //      <td><&nbsp;</td>
    //      <td valign="middle" align="center">_BUILD_</td>
    //      <td><&nbsp;</td>
    //      <td valign="middle" align="center">_DATE_</td>
    //      <td><&nbsp;</td>
    //      <td valign="middle" align="center">_VERDICT_BOX_</td>
    //      <td><&nbsp;</td>
    //      <td valign="middle" align="center">_TESTER_</td>
    //   </tr>
    //   more testcaseresult rows...
    //</table>
    
    function byFormattedID(a, b) {
        // compares the integer portion of TC22, TC9
        var a_num = parseInt(a.substring(2, a.length), 10);
        var b_num = parseInt(b.substring(2, b.length), 10);
        return a_num - b_num;
    }
    
    var busySpinner;
    
    function organizeResultsByTestCase(testCaseResults) {
        var testCaseHolder = {};  // will be keyed by TestCase FormattedID with a value of
        // {'TestCase': tc, 'results': [tcr, tcr, tcr, tcr, ...]}
        var tcr, tc;
        for (var ix = 0; ix < testCaseResults.length; ix++) {
            tcr = testCaseResults[ix];
            if (tcr.hasOwnProperty('TestCase'))   // and some TestCaseResult items won't
            {
                tc = tcr.TestCase;
                if (tc !== undefined) {
                    if (!testCaseHolder.hasOwnProperty(tc.FormattedID))  // no existing entry for tc.FormattedID ?
                    {
                        testCaseHolder[tc.FormattedID] = {'TestCase': tc, 'results': []};
                    }
                    testCaseHolder[tc.FormattedID].results.push(tcr);
                }
            }
        }
        return testCaseHolder;
    }
    
    function ascendingOrderedTestCases(testCaseHolder) {
        var testCases = [];
        rally.forEach(testCaseHolder, function (targetObj, formattedID) {
            testCases.push(formattedID);
        });
        testCases.sort(byFormattedID);
        return testCases;
    }
    
    function drawBox(verdict) {
        var verdictClass = 'pass-legend-inconclusive';
        if (verdict === 'Pass') {
            verdictClass = 'pass-legend';
        }
        if (verdict === 'Fail') {
            verdictClass = 'pass-legend-fail';
        }
        return '<div class="' + verdictClass + '">' + verdict + '</div>';
    }
    
    function createTestCaseResultTable(testcaseresults) {
        // construct a table with a header row for the testcaseresults
        var tcrTable = TCR_TABLE;
        // add a row in the table for each testcaseresult
        for (rix = 0; rix < testcaseresults.length; rix++) {
            var tcr = testcaseresults[rix];
            var tcrDate = tcr.Date.replace('T', ' ').replace(/\.\d+Z/, ' UTC');
            var verdictBox = drawBox(tcr.Verdict);
            //console.log("    " + tcr.ObjectID + " " + tcr.Build + " " + tcrDate + " " + tcr.Verdict);
            //console.log("    -- (" + tcr.WorkProduct.FormattedID + " " + tcr.WorkProduct.Name + ")");
            tcrLink = rally.sdk.util.Navigation.createRallyDetailUrl(tcr);
    
            var tcrRow = TCR_ROW.replace('_TCR_LINK_', tcrLink);
            tcrRow = tcrRow.replace('_TCR_IDENT_', tcr.ObjectID);
            tcrRow = tcrRow.replace('_BUILD_', tcr.Build);
            tcrRow = tcrRow.replace('_DATE_', tcrDate);
            tcrRow = tcrRow.replace('_VERDICT_BOX_', verdictBox);
            var tester = "";
            if ((tcr.Tester !== null) && (tcr.Tester.DisplayName !== null)) {
                tester = tcr.Tester.DisplayName;
            }
            tcrRow = tcrRow.replace('_TESTER_', tester);
            tcrTable += tcrRow;
        }
        tcrTable += TABLE_END;
        // wrap the Test Case Result table in a DIV
        tcrTable = '<DIV class="tcrDiv">' + tcrTable + '</DIV>';
    
        return tcrTable;
    }
    
    function assembleTestCaseAndResultsTable(testCases, testCaseHolder) {
        var table = "";
        var testCase, testCaseResults;
        var tcIdent, tcLink, tcDetailUrl;
        var wpInfo,  wpLink, wpDetailUrl;
        var tcFormattedID, tcrLink;
    
        for (var ix = 0; ix < testCases.length; ix++) {
            tcFormattedID = testCases[ix];
            testCase = testCaseHolder[tcFormattedID].TestCase;
            testCaseResults = testCaseHolder[tcFormattedID].results;
            table += TC_TABLE_START;
            tcDetailUrl = rally.sdk.util.Navigation.createRallyDetailUrl(testCase);
            tcLink = TC_LINK.replace('_TARGET_URL_', tcDetailUrl);
            tcLink = tcLink.replace('_ID_', testCase.FormattedID);
            tcLink = tcLink.replace('_NAME_', testCase.Name);
            tcIdent = testCase.ObjectID + " " + testCase.FormattedID + " " + testCase.Name;
            wpInfo = "";  // WorkProduct info (Ident + Name) for link purposes
            wpLink = "";  // prime to be empty just in case the Test Case has no associated WorkProduct
            if (testCase.WorkProduct !== null) {
                wpInfo = testCase.WorkProduct.FormattedID + " " + testCase.WorkProduct.Name;
                wpDetailUrl = rally.sdk.util.Navigation.createRallyDetailUrl(testCase.WorkProduct);
                wpLink = WP_LINK.replace("_WP_TARGET_", wpDetailUrl).replace("_WP_TEXT_", wpInfo);
            }
            tcLink = tcLink.replace("_WP_LINK_", " &nbsp;&nbsp; " + wpLink);
            //console.log(tcIdent + " (" + wpInfo + ")");
            table += tcLink;
            if (testCaseResults.length < 1) {
                console.log("-----> no testcaseresults associated with this Test Case");
                // wrap the 'None' indication table in a DIV
                table += '<DIV class="tcrDiv">' + EMPTY_TCR_TABLE + '</DIV>';
            }
            else {
                // add a nested table with a row for each TestCaseResult in testCaseResults,
                // have the TestCaseResult.ObjectID field be a link to open up the detail for the TestCaseResult
                // also show the build, the date the TestCaseresult was generated and the verdict (Pass/Fail)
                //console.log("-----> " + testCaseResults.length + " results associated with this TestCase");
                var tcrTable = createTestCaseResultTable(testCaseResults);
                table += tcrTable;
            }
            table += ROW_END + EMPTY_ROW + TABLE_END;
        }
        return table;
    }
    
    function showResults(queryResults) {
        busySpinner.hide();
        //console.log("Number of test cases returned by the Test Case/Test Case Results query: " +
        //             queryResults.testcase.length);
    
        if (queryResults.testcaseresults.length === 0) {
            var message = "No Test Case information found for the current workspace and project";
            document.getElementById("TestCaseInfo").innerHTML = message;
    
            return;
        }
    
        var testCaseHolder = organizeResultsByTestCase(queryResults.testcaseresults);
        var testCases = ascendingOrderedTestCases(testCaseHolder);
        var table = assembleTestCaseAndResultsTable(testCases, testCaseHolder);
        document.getElementById("TestCaseInfo").innerHTML = table;
    }
    
    function previousDate(spanDays) {
        var dayMillis = 86400 * 1000;   // seconds in 1 day times 1000 for milliseconds value
        var today = new Date().getTime();  // in terms of epoch milliseconds
        var prevDate = new Date(today - (spanDays * dayMillis));
        var isoDate = rally.sdk.util.DateTime.toIsoString(prevDate);
        return isoDate;
    }
    
    this.runMainQuery = function(rallyDataSource) {
        document.getElementById("TestCaseInfo").innerHTML = "";
        busySpinner = new rally.sdk.ui.basic.Wait({hideTarget: false});
        busySpinner.display('spinner');
        var daySpan = 30; // how many days back from today for TestCaseResult inclusion
        var dateBoundingClause = '(Date >= "' + previousDate(daySpan) + '")';
        querySpec = {
            key   : "testcaseresults",
            type  : "testcaseresults",
            fetch : 'ObjectID,Build,Date,Verdict,Duration,Tester,UserName,DisplayName,TestCase,FormattedID,Name,WorkProduct',
            query : dateBoundingClause,
            order : 'Date Desc'
        };
    
        rallyDataSource.findAll(querySpec, showResults);
    }
}
