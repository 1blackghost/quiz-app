$(document).ready(function() {
    fetchQuizzes();
    $('#addButton').click(function() {
        $('#addQuizForm').slideToggle('slow');
    });

});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function submitQuiz() {
    var question = $('#questionInput').val();
    var option1 = $('#option1Input').val();
    var option2 = $('#option2Input').val();
    var option3 = $('#option3Input').val();
    var rightAnswer = $('#rightAnswerInput').val();
    var startDate = $('#startDateInput').val();
    var endDate = $('#endDateInput').val();

    var quizData = {
        "question": question,
        "options": [option1, option2, option3],
        "rightAnswer": rightAnswer,
        "startDate": startDate,
        "endDate": endDate
    };
    console.log(quizData)
    $.ajax({
        url: '/quizzes',
        type: 'POST',
        data: JSON.stringify(quizData),
        contentType: 'application/json',
        success: function(response) {
            $('#createQuizMessage').text('Quiz created successfully!');
            $('#createQuizMessage').addClass('success-message');
            $('#createQuizMessage').show();
            $('#addQuizForm').slideUp('slow');

            console.log('Quiz created successfully!');
            console.log(response);
            fetchQuizzes();
        },
        error: function(error) {
            console.error('Error creating quiz:', error);
        }
    });
}

function updateQuizList(quizData) {
    var quizList = $('.quiz-list');
    quizList.empty();

    // Add the headings
    var quizHeadings = $('<li class="quiz-list-item"></li>');
    quizHeadings.append('<span class="quiz-heading">Quiz ID</span>');
    quizHeadings.append('<span class="quiz-heading">Status</span>');
    quizHeadings.append('<span class="quiz-heading">Attend</span>');
    quizHeadings.append('<span class="quiz-heading">Results</span>');

    quizList.append(quizHeadings);

    // Add the quiz items
    quizData.forEach(function(quiz) {
        var quizItem = $('<li class="quiz-list-item"></li>');
        quizItem.append('<span class="quiz-title">' + quiz[0] + '</span>');

        var currentDate = new Date();
        var startDate = new Date(quiz[6]);
        var endDate = new Date(quiz[7]);

        // Check if the current time is before the start time
        if (currentDate < startDate) {
            quizItem.append('<span class="quiz-status finished">Inactive</span>');
            quizItem.append('<button class="attend-quiz-button2" disabled>Attend</button>');
        }
        // Check if the current time is after the end time
        else if (currentDate > endDate) {
            quizItem.append('<span class="quiz-status finished">Finished</span>');
            quizItem.append('<button class="attend-quiz-button2" disabled>Attend</button>');
        } else {
            quizItem.append('<span class="quiz-status active">Active</span>');
            quizItem.append('<button class="attend-quiz-button" onclick="attendQuiz(' + quiz[0] + ')">Attend</button>');
        }
        quizItem.append('<span class="quiz-info"><button class="results-button" id="result" onclick="getResults(' + quiz[0] + ')">Results</button></span>');

        $('.quiz-list').append(quizItem);

        quizList.append(quizItem);
    });
}

function attendQuiz(quizId) {
    $('.quizzes-section').empty();
    $("#c2").hide();

    var quizContainer = $('<div class="quiz-container"></div>');
    var quizIdElement = $('<h3>Your Name: </h3><input type="text" id="name" name="name"><button onclick="submitName(' + quizId + ')" class="attend-quiz-button">Submit</button>');

    quizContainer.append(quizIdElement);

    $('.quizzes-section').append(quizContainer);


}

function submitName(quizId) {
    const data = {
        name: $("#name").val()
    };
    $.ajax({
        url: '/getname', // Specify the URL to which you want to send the POST request
        type: 'POST', // Specify the HTTP method
        data: data,
        dataType: 'json', // Specify the expected data type of the response
        success: function(response) {
            // Handle the success response
            console.log('POST request successful!');
            console.log(response);
            continueWithQuiz(quizId);

        },
        error: function(error) {
            // Handle the error response
            console.error('Error in POST request');
            console.error(error);
        }
    });

}


function continueWithQuiz(quizId) {
    // Make an AJAX request to fetch the quiz details for the given quiz ID
    $.ajax({
        url: '/quizzes/' + quizId,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            // Clear the HTML content of the quiz section
            $('.quizzes-section').empty();

            console.log('Quiz details retrieved successfully!');
            console.log(response);

            // Extract the quiz details from the response
            var quizDetails = response;
            var quizId = quizDetails.uid;
            var question = quizDetails.question;
            var options = [quizDetails.option1, quizDetails.option2, quizDetails.option3, quizDetails.rightAnswer];


            // Create the quiz container
            var quizContainer = $('<div class="quiz-container"></div>');
            // Add the quiz ID
            var quizIdElement = $('<h3>Quiz ID: ' + quizId + '</h3>');
            quizContainer.append(quizIdElement);

            // Add the question as heading
            var questionElement = $('<h3>' + question + '</h3>');
            quizContainer.append(questionElement);

            // Shuffle the options
            options = shuffle(options);

            // Create radio buttons for the options
            options.forEach(function(option, index) {
                var optionElement = $('<div class="option"><input type="radio" name="option" value="' + option + '"><label>' + option + '</label></div>');

                quizContainer.append(optionElement);
            });

            // Create the submit button
            var submitButton = $('<button class="attend-quiz-button" onclick="submitAnswer(' + quizId + ')">Submit</button>');
            quizContainer.append(submitButton);

            // Append the quiz container to the quizzes section
            $('.quizzes-section').append(quizContainer);
            $("#c2").hide();
        },
        error: function(error) {
            console.error('Error retrieving quiz details');
        }
    });
}

function submitAnswer(quizId) {
    // Get the selected answer
    var selectedAnswer = $('input[name="option"]:checked').val();

    // Make an AJAX request to submit the answer
    $.ajax({
        url: '/submitanswer/' + quizId,
        type: 'POST',
        data: {
            answer: selectedAnswer
        },
        success: function(response) {
            console.log('Answer submitted successfully!');
            console.log(response);

            // Reload the quiz section with updated content
            $.ajax({
                url: '/',
                type: 'GET',
                dataType: 'html',
                success: function(response) {
                    // Update the necessary sections of the page with the new content
                    $('.quizzes-section').html($(response).find('.quizzes-section').html());
                    // ...
                    // Update other sections as needed
                    // ...

                    // Hide the element with ID 'c2'
                    $("#c2").show();
                },
                error: function(error) {
                    console.error('Error updating the page:', error);
                }
            });
        },
        error: function(error) {
            console.error('Error submitting answer');
        }
    });
}




function fetchQuizzes() {
    $.ajax({
        url: '/quizzes/all',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Quiz data retrieved successfully!');
            console.log(response);
            updateQuizList(response); // Update the quiz list with the retrieved data
        },
        error: function(error) {
            console.error('Error retrieving quiz data:', error);
        }
    });
}
setInterval(fetchQuizzes, 2000);

function getResults(id) {
    var quizSection = $('.quiz');
    var table = $('.results-table');

    if (quizSection.is(':visible') && table.is(':visible')) {
        // Slide up the table with a fast animation
        table.slideUp('fast', function() {});
    } else {
        continueGetResults();
    }

    function continueGetResults() {
        $.ajax({
            url: '/quizzes/result/' + id,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                console.log('GET request successful!');
                console.log(response);

                // Clear the window
                quizSection.empty();

                // Create the table
                var newTable = $('<table>').addClass('results-table');
                var thead = $('<thead>');
                var tbody = $('<tbody>');
                var trHead = $('<tr>');
                var thName = $('<th>').text('Name');
                var thResult = $('<th>').text('Result');

                trHead.append(thName, thResult);
                thead.append(trHead);
                newTable.append(thead);

                // Add rows to the table
                $.each(response, function(index, result) {
                    var tr = $('<tr>');
                    var tdName = $('<td>').text(result[0]);
                    var tdResult = $('<td>').text(result[1]);

                    if (result[1] === 'Wrong Answer') {
                        tdResult.css('color', 'red');
                    } else if (result[1] === 'Correct Answer') {
                        tdResult.css('color', 'green');
                    }

                    tr.append(tdName, tdResult);
                    tbody.append(tr);
                });


                newTable.append(tbody);

                // Append the table to the .quiz section
                quizSection.empty().append(newTable);

                // Show the .quiz section
                quizSection.slideDown('slow');
            },
            error: function(error) {
                console.error('Error in GET request');
                console.error(error);
            }
        });
    }

}