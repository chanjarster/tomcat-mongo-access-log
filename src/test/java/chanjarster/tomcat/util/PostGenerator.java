package chanjarster.tomcat.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Random;

import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;

public class PostGenerator {

  protected static final Random r = new Random();
  
  public static HttpUriRequest gen(int port) throws URISyntaxException {
    String uri = "http://localhost:" + port + uris[r.nextInt(uris.length)];
    RequestBuilder rb = RequestBuilder.post().setUri(new URI(uri));
    for(int j = 0; j < r.nextInt(paramNames.length); j++) {
      rb.addParameter(
          paramNames[r.nextInt(paramNames.length)], 
          paramValues[r.nextInt(paramValues.length)]
      );
    }
    rb.addHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    return rb.build();
  }
  
  protected static final String[] uris = {
      "/", 
      "/lesson.action", 
      "/course.action", 
      "/course/grade/teacher.action", 
      "/login.action",
      "/teacher.action",
      "/menu.action",
      "/function.action",
      "/role.action",
      "/manualArrange.action",
      "/multiManualArrange.action",
      "/questionaire.action",
      "/evaluate.action",
      "/openCourse.action",
      "/closeCourse.action",
      "/drive"
  };

  protected static final String[] paramNames = {
    "student.id", 
    "lesson.id", 
    "course.name", 
    "course.code",
    "student.code",
    "student.major.id",
    "project.id",
    "project.name",
    "major.id",
    "major.name",
    "major.code",
    "direction.code",
    "depart.id",
    "teachDepart.id",
    "teacher.code",
    "teacher.id"
  };

  protected static final String[] paramValues = {
    "3971212", 
    "12D000A", 
    "C++程序语言", 
    "中文入门", 
    "国家地理",
    "大学语文",
    "大学英语",
    "大学数学",
    "大学物理",
    "Physics",
    "English",
    "Japan History",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  };
  
}
